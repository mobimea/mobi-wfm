import { createClient } from "npm:@supabase/supabase-js@2.25.0";
import * as XLSX from "npm:xlsx@0.18.5";
import Papa from "npm:papaparse@5.4.1";

/**
 * Bulk import Edge Function:
 * - Accepts JSON POST: { import_id: "<uuid-or-id>", file_url: "<public-or-signed-url>" }
 * - Supports CSV (.csv) and Excel (.xlsx/.xls)
 * - Validates required fields (first_name, last_name, email)
 * - Upserts into `employees` on email conflict (chunks)
 * - Updates `employee_imports` row with results
 */

// --- CONFIG ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB max (tweak if you want)

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  // let execution continue so errors in runtime surface to logs
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

console.info("employee_bulk_import function starting");

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const payload = await req.json().catch(() => null);
    if (!payload || !payload.file_url) {
      return jsonResponse({ error: "file_url is required" }, 400);
    }
    const { file_url, uploaded_by } = payload;

    // Create import record in the Edge Function with service role
    const { data: importRecord, error: importError } = await supabase
      .from("employee_imports")
      .insert({
        uploaded_by: uploaded_by || null,
        file_url: file_url,
        status: "processing"
      })
      .select("id")
      .single();

    if (importError) {
      console.error("Failed to create import record:", importError);
      return jsonResponse({ error: "Failed to create import record: " + importError.message }, 500);
    }

    const import_id = importRecord.id;

    // Fetch file (file_url can be public or a signed URL from Supabase Storage)
    const fileResp = await fetch(file_url);
    if (!fileResp.ok) {
      await markImportFailed(import_id, `Failed to fetch file: ${fileResp.status} ${fileResp.statusText}`);
      return jsonResponse({ error: "Failed to fetch file" }, 400);
    }

    // Size guard
    const contentLength = Number(fileResp.headers.get("content-length") || "0");
    if (contentLength && contentLength > MAX_FILE_BYTES) {
      await markImportFailed(import_id, `File too large: ${contentLength} bytes`);
      return jsonResponse({ error: `File too large (${contentLength} bytes)` }, 413);
    }

    const buffer = await fileResp.arrayBuffer();
    if (buffer.byteLength > MAX_FILE_BYTES) {
      await markImportFailed(import_id, `File too large (bytes): ${buffer.byteLength}`);
      return jsonResponse({ error: "File too large" }, 413);
    }

    // Choose parser by content-type or file extension; fallback tries both
    const contentType = (fileResp.headers.get("content-type") || "").toLowerCase();
    let rawRows: any[] = [];
    const urlLower = file_url.toLowerCase();

    try {
      if (contentType.includes("csv") || urlLower.endsWith(".csv")) {
        rawRows = await parseCSV(buffer);
      } else if (contentType.includes("spreadsheet") || urlLower.endsWith(".xlsx") || urlLower.endsWith(".xls")) {
        rawRows = await parseExcel(buffer);
      } else {
        // fallback: try Excel first, then CSV
        try {
          rawRows = await parseExcel(buffer);
        } catch (eExcel) {
          rawRows = await parseCSV(buffer); // may throw — handled below
        }
      }
    } catch (parseErr) {
      console.error("Parse error:", parseErr);
      await markImportFailed(import_id, `Parse error: ${String(parseErr?.message ?? parseErr)}`);
      return jsonResponse({ error: "Failed to parse file", details: String(parseErr?.message ?? parseErr) }, 400);
    }

    // Normalize & validate
    const { validRows, errors } = normalizeAndValidate(rawRows);

    if (validRows.length === 0) {
      await updateImportRecord(import_id, "failed", { errors });
      return jsonResponse({ inserted: 0, errors }, 200);
    }

    // Upsert in chunks, accumulate processed/upserted counts
    const upserted = await upsertEmployeesInChunks(validRows, supabase, import_id);

    // Mark import finished with summary
    await updateImportRecord(import_id, "finished", { processed: validRows.length, upserted, errors });

    return jsonResponse({ processed: validRows.length, upserted, errors }, 200);
  } catch (err) {
    console.error("Unhandled error in employee_bulk_import", err);
    return jsonResponse({ error: "Internal server error", details: String(err?.message ?? err) }, 500);
  }
});

// ----------------- Helpers -----------------

function jsonResponse(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

async function parseCSV(buffer: ArrayBuffer) {
  const text = new TextDecoder().decode(buffer);
  const result = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (result.errors && result.errors.length) {
    // If there are non-fatal parse errors, we'll still try but bubble them to logs
    console.warn("PapaParse warnings/errors:", result.errors.slice(0, 5));
  }
  // result.data is an array of row objects keyed by header names
  return result.data as any[];
}

async function parseExcel(buffer: ArrayBuffer) {
  const data = new Uint8Array(buffer);
  const workbook = XLSX.read(data, { type: "array" });
  if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) throw new Error("No sheets found in workbook");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // sheet_to_json returns array of objects keyed by header row
  const json = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as any[];
  return json;
}

/**
 * Normalize varied header names and validate required fields.
 * Accepts rawRows where header names might be "First Name", "first_name", "firstname", etc.
 */
function normalizeAndValidate(rawRows: any[]) {
  const validRows: any[] = [];
  const errors: any[] = [];

  const canonicalizeKey = (k: string) =>
    k
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i] ?? {};
    // build normalized map: lowercased/underscored keys
    const norm: Record<string, string> = {};
    for (const key of Object.keys(raw)) {
      const nk = canonicalizeKey(key);
      const val = raw[key] == null ? "" : String(raw[key]);
      norm[nk] = val.trim();
    }

    // common variants
    const first_name = norm["first_name"] || norm["firstname"] || norm["given_name"] || norm["givenname"] || norm["first"];
    const last_name = norm["last_name"] || norm["lastname"] || norm["family_name"] || norm["last"];
    const email = norm["email"] || norm["e_mail"] || norm["email_address"] || norm["emailaddress"];
    const phone = norm["phone"] || norm["mobile"] || norm["telephone"] || norm["phone_number"];
    const hired_at = norm["hired_at"] || norm["hire_date"] || norm["hired"] || norm["start_date"];

    const missing: string[] = [];
    if (!first_name || !first_name.trim()) missing.push("first_name");
    if (!last_name || !last_name.trim()) missing.push("last_name");
    if (!email || !email.trim()) missing.push("email");

    // Basic email sanity check (very simple)
    const emailValue = (email || "").trim();
    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      missing.push("email (invalid format)");
    }

    if (missing.length) {
      errors.push({ row: i + 1, raw, reason: `Missing/invalid fields: ${missing.join(", ")}` });
      continue;
    }

    validRows.push({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: emailValue.toLowerCase(),
      phone: (phone || "").trim() || null,
      hired_at: parseDateOrNow(hired_at),
    });
  }

  return { validRows, errors };
}

function parseDateOrNow(value?: string) {
  if (!value) return new Date().toISOString();
  // Try to parse ISO or common formats; if invalid fallback to now
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d.toISOString();
  return new Date().toISOString();
}

async function upsertEmployeesInChunks(rows: any[], supabaseClient: any, importId: any) {
  const CHUNK = 500; // safer chunk size for DB
  let totalUpserted = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { data, error } = await supabaseClient.from("employees").upsert(chunk, { onConflict: ["email"] }).select("id,email");
    if (error) {
      // mark import failed and throw to abort
      await markImportFailed(importId, `Database upsert error: ${error.message || String(error)}`);
      throw new Error(`DB upsert error: ${error.message || JSON.stringify(error)}`);
    }
    totalUpserted += Array.isArray(data) ? data.length : chunk.length;
  }

  return totalUpserted;
}

// update import row to failed with message
async function markImportFailed(importId: any, reason: string) {
  try {
    await supabase.from("employee_imports").update({ status: "failed", result: reason, processed_at: new Date().toISOString() }).eq("id", importId);
  } catch (e) {
    console.error("Failed to mark import failed:", e);
  }
}

// update import row with structured result
async function updateImportRecord(importId: any, status: string, result: any) {
  const payload = {
    status,
    result: typeof result === "string" ? result : JSON.stringify(result),
    processed_at: new Date().toISOString(),
  };
  try {
    await supabase.from("employee_imports").update(payload).eq("id", importId);
  } catch (e) {
    console.error("Failed to update import record:", e);
  }
}
