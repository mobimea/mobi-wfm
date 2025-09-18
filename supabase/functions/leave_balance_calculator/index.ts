/// <reference types="https://deno.land/std@0.177.0/types/react/index.d.ts" />
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js?dts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    const { employee_id, year, action } = await req.json();

    if (!year) {
      return new Response(
        JSON.stringify({ error: "Missing year" }),
        { status: 400 }
      );
    }

    // Handle year-end processing for all employees
    if (action === 'year_end_processing' && !employee_id) {
      return await processYearEndForAllEmployees(year);
    }

    if (!employee_id) {
      return new Response(
        JSON.stringify({ error: "Missing employee_id" }),
        { status: 400 }
      );
    }

    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("*")
      .eq("id", employee_id)
      .single();

    if (employeeError || !employee) {
      return new Response(
        JSON.stringify({ error: "Employee not found" }),
        { status: 404 }
      );
    }

    // Get or create leave balance record for the year
    let { data: leaveBalance, error: balanceError } = await supabase
      .from("employee_leave_balances")
      .select("*")
      .eq("employee_id", employee_id)
      .eq("year", year)
      .single();

    if (balanceError && balanceError.code === 'PGRST116') {
      // Create new balance record if it doesn't exist
      const { data: newBalance, error: createError } = await supabase
        .from("employee_leave_balances")
        .insert({
          employee_id,
          year,
          vacation_days: 28, // Default annual vacation days
          emergency_days: 5, // Default emergency days
          local_days: 5, // Default local days
          paid_local: 5, // Default paid local days
          paid_sick: 10, // Default paid sick days
          carried_over: 0,
          encashed: 0,
          taken: 0
        })
        .select()
        .single();

      if (createError) {
        return new Response(
          JSON.stringify({ error: "Failed to create leave balance: " + createError.message }),
          { status: 500 }
        );
      }
      leaveBalance = newBalance;
    }

    // Get approved leaves for the year
    const { data: approvedLeaves, error: leavesError } = await supabase
      .from("leaves")
      .select("*")
      .eq("employee_id", employee_id)
      .eq("status", "approved")
      .gte("start_date", `${year}-01-01`)
      .lte("end_date", `${year}-12-31`);

    if (leavesError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch leaves: " + leavesError.message }),
        { status: 500 }
      );
    }

    // Calculate taken days by leave type
    const takenDays = {
      vacation: 0,
      emergency: 0,
      local: 0,
      paid_local: 0,
      paid_sick: 0
    };

    approvedLeaves?.forEach(leave => {
      const days = leave.total_days || 0;
      if (leave.type in takenDays) {
        takenDays[leave.type as keyof typeof takenDays] += days;
      }
    });

    // Calculate remaining balances
    const remainingBalances = {
      vacation: Math.max(0, (leaveBalance.vacation_days + leaveBalance.carried_over) - takenDays.vacation),
      emergency: Math.max(0, leaveBalance.emergency_days - takenDays.emergency),
      local: Math.max(0, leaveBalance.local_days - takenDays.local),
      paid_local: Math.max(0, leaveBalance.paid_local - takenDays.paid_local),
      paid_sick: Math.max(0, leaveBalance.paid_sick - takenDays.paid_sick)
    };

    // Handle year-end processing if requested
    if (action === 'year_end_processing') {
      const nextYear = year + 1;
      
      // Check if next year balance already exists
      const { data: nextYearBalance } = await supabase
        .from("employee_leave_balances")
        .select("*")
        .eq("employee_id", employee_id)
        .eq("year", nextYear)
        .single();

      if (!nextYearBalance) {
        // Create next year balance with carryover
        const carryoverDays = Math.min(remainingBalances.vacation, 5); // Max 5 days carryover
        
        await supabase
          .from("employee_leave_balances")
          .insert({
            employee_id,
            year: nextYear,
            vacation_days: 28,
            emergency_days: 5,
            local_days: 5,
            paid_local: 5,
            paid_sick: 10,
            carried_over: carryoverDays,
            encashed: 0,
            taken: 0
          });

        // Update current year with carryover info
        await supabase
          .from("employee_leave_balances")
          .update({ carried_over: carryoverDays })
          .eq("id", leaveBalance.id);
      }
    }

    // Update taken days in current balance
    const totalTaken = Object.values(takenDays).reduce((sum, days) => sum + days, 0);
    await supabase
      .from("employee_leave_balances")
      .update({ taken: totalTaken })
      .eq("id", leaveBalance.id);

    return new Response(
      JSON.stringify({
        message: "Leave balance calculated successfully",
        employee: {
          id: employee.id,
          name: employee.name,
          employee_id: employee.employee_id
        },
        year,
        balances: {
          allocated: {
            vacation: leaveBalance.vacation_days,
            emergency: leaveBalance.emergency_days,
            local: leaveBalance.local_days,
            paid_local: leaveBalance.paid_local,
            paid_sick: leaveBalance.paid_sick,
            carried_over: leaveBalance.carried_over
          },
          taken: takenDays,
          remaining: remainingBalances,
          total_taken: totalTaken
        }
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in leave_balance_calculator:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
});

async function processYearEndForAllEmployees(year: number) {
  try {
    // Get all employees
    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("id, employee_id, name")
      .eq("status", "employed");

    if (employeesError) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch employees: " + employeesError.message }),
        { status: 500 }
      );
    }

    let processedCount = 0;
    const errors: string[] = [];

    for (const employee of employees || []) {
      try {
        // Get or create leave balance record for the year
        let { data: leaveBalance, error: balanceError } = await supabase
          .from("employee_leave_balances")
          .select("*")
          .eq("employee_id", employee.id)
          .eq("year", year)
          .single();

        if (balanceError && balanceError.code === 'PGRST116') {
          // Create new balance record if it doesn't exist
          const { data: newBalance, error: createError } = await supabase
            .from("employee_leave_balances")
            .insert({
              employee_id: employee.id,
              year,
              vacation_days: 28,
              emergency_days: 5,
              local_days: 5,
              paid_local: 5,
              paid_sick: 10,
              carried_over: 0,
              encashed: 0,
              taken: 0
            })
            .select()
            .single();

          if (createError) {
            errors.push(`Failed to create balance for ${employee.name}: ${createError.message}`);
            continue;
          }
          leaveBalance = newBalance;
        }

        // Calculate remaining vacation days
        const remainingVacation = Math.max(0, (leaveBalance.vacation_days + leaveBalance.carried_over) - leaveBalance.taken);
        
        // Create next year balance with carryover (max 5 days)
        const nextYear = year + 1;
        const carryoverDays = Math.min(remainingVacation, 5);

        // Check if next year balance already exists
        const { data: nextYearBalance } = await supabase
          .from("employee_leave_balances")
          .select("*")
          .eq("employee_id", employee.id)
          .eq("year", nextYear)
          .single();

        if (!nextYearBalance) {
          await supabase
            .from("employee_leave_balances")
            .insert({
              employee_id: employee.id,
              year: nextYear,
              vacation_days: 28,
              emergency_days: 5,
              local_days: 5,
              paid_local: 5,
              paid_sick: 10,
              carried_over: carryoverDays,
              encashed: 0,
              taken: 0
            });
        }

        processedCount++;
      } catch (employeeError) {
        errors.push(`Error processing ${employee.name}: ${employeeError}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Year-end processing completed",
        employeesProcessed: processedCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: "Year-end processing failed: " + error }),
      { status: 500 }
    );
  }
}
