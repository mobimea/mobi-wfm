/// <reference types="https://deno.land/std@0.177.0/types/react/index.d.ts" />
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js?dts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface PayslipData {
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
}

serve(async (req) => {
  try {
    const { employee_id, month, year, basic_salary, allowances, deductions }: PayslipData = await req.json();

    if (!employee_id || !month || !year || basic_salary === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required payslip data" }),
        { status: 400 }
      );
    }

    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("*")
      .eq("employee_id", employee_id)
      .single();

    if (employeeError || !employee) {
      return new Response(
        JSON.stringify({ error: "Employee not found" }),
        { status: 404 }
      );
    }

    const net_pay = basic_salary + (allowances || 0) - (deductions || 0);

    // Generate PDF content (simplified HTML for now)
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${employee.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .employee-info { margin-bottom: 20px; }
          .payslip-table { width: 100%; border-collapse: collapse; }
          .payslip-table th, .payslip-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .payslip-table th { background-color: #f2f2f2; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PAYSLIP</h1>
          <h3>Month: ${month}/${year}</h3>
        </div>
        
        <div class="employee-info">
          <p><strong>Employee Name:</strong> ${employee.name}</p>
          <p><strong>Employee ID:</strong> ${employee.employee_id}</p>
          <p><strong>Department:</strong> ${employee.department}</p>
          <p><strong>Position:</strong> ${employee.position}</p>
        </div>

        <table class="payslip-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount (RS)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Salary</td>
              <td>${basic_salary.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Allowances</td>
              <td>${(allowances || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Deductions</td>
              <td>-${(deductions || 0).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Net Pay</strong></td>
              <td><strong>${net_pay.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 30px;">
          <p><em>Generated on: ${new Date().toLocaleDateString()}</em></p>
        </div>
      </body>
      </html>
    `;

    // Convert HTML to PDF (using a simple approach for now)
    const pdfBlob = new Blob([pdfContent], { type: 'text/html' });
    
    // Upload PDF to Supabase Storage
    const fileName = `payslip_${employee_id}_${month}_${year}.html`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("payslips")
      .upload(fileName, pdfBlob, {
        contentType: 'text/html',
        upsert: true
      });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: "Failed to upload payslip: " + uploadError.message }),
        { status: 500 }
      );
    }

    // Save payslip record to database
    const { data: payslipRecord, error: insertError } = await supabase
      .from("payslips")
      .insert({
        employee_id: employee.id,
        month,
        year,
        basic_salary,
        allowances: allowances || 0,
        deductions: deductions || 0,
        pdf_url: uploadData.path
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to save payslip record: " + insertError.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: "Payslip generated successfully",
        payslip: payslipRecord,
        pdf_url: uploadData.path
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in payslip_generator:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
});
