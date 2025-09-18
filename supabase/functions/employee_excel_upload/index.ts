import { createClient } from "npm:@supabase/supabase-js@2.25.0";

// Environment vars supplied by Supabase Edge runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Required environment variables are missing');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});

console.info('employee_excel_upload function starting');

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', {
      status: 405
    });

    const payload = await req.json();
    if (!payload?.import_id || !payload?.file_url) {
      return new Response(JSON.stringify({
        error: 'import_id and file_url are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const { import_id, file_url } = payload;

    // Fetch the file. In production, you might use Storage API or signed URL.
    const fileResp = await fetch(file_url);
    if (!fileResp.ok) {
      await markImportFailed(import_id, `Failed to fetch file: ${fileResp.status} ${fileResp.statusText}`);
      return new Response(JSON.stringify({
        error: 'Failed to fetch file'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // NOTE: Excel parsing is simulated here. Replace with a real parser (e.g., npm:@exceljs if you add it)
    // We'll use sample parsed data to simulate real rows.
    const parsedRows = simulateParseExcelSample();

    // Validate rows
    const validRows = [];
    const errors = [];

    parsedRows.forEach((row, idx) => {
      const missing = [];
      if (!row.first_name?.trim()) missing.push('first_name');
      if (!row.last_name?.trim()) missing.push('last_name');
      if (!row.email?.trim()) missing.push('email');
      if (missing.length) {
        errors.push({
          row: idx + 1,
          reason: `Missing required fields: ${missing.join(', ')}`
        });
      } else {
        // normalize minimal fields
        validRows.push({
          ...row,
          email: row.email.trim().toLowerCase()
        });
      }
    });

    if (validRows.length === 0) {
      await updateImportRecord(import_id, 'failed', {
        errors
      });
      return new Response(JSON.stringify({
        inserted: 0,
        errors
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Batch upsert into employees table. Adjust conflict target and columns per your schema.
    const { data, error } = await supabase.from('employees').upsert(validRows, {
      onConflict: [
        'email'
      ]
    }).select('id,email');

    if (error) {
      await markImportFailed(import_id, `Database upsert error: ${error.message}`);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Update import record to finished
    await updateImportRecord(import_id, 'finished', {
      inserted: data?.length ?? validRows.length,
      errors
    });

    return new Response(JSON.stringify({
      inserted: data?.length ?? validRows.length,
      errors
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('Unhandled error in employee_excel_upload', err);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});

// Helper: simulate parsed rows from an Excel file
function simulateParseExcelSample() {
  return [
    {
      first_name: 'Alice',
      last_name: 'Johnson',
      email: 'alice.johnson@example.com',
      phone: '555-0101',
      hired_at: new Date().toISOString()
    },
    {
      first_name: 'Bob',
      last_name: 'Smith',
      email: 'bob.smith@example.com',
      phone: '555-0123',
      hired_at: new Date().toISOString()
    },
    {
      first_name: '',
      last_name: 'NoFirstName',
      email: 'invalid@example.com'
    }
  ];
}

// Helper: mark import failed with message
async function markImportFailed(importId, reason) {
  await supabase.from('employee_imports').update({
    status: 'failed',
    result: reason
  }).eq('id', importId);
}

// Helper: update import record with structured result
async function updateImportRecord(importId, status, result) {
  const payload = {
    status,
    result: typeof result === 'string' ? result : JSON.stringify(result),
    processed_at: new Date().toISOString()
  };
  await supabase.from('employee_imports').update(payload).eq('id', importId);
}
