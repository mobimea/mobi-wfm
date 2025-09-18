import { createClient } from '@supabase/supabase-js';

// Load service_role key from environment variables (ensure this is set securely in your backend environment)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseAdmin: any = null;

// Only initialize if environment variables are available
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
} else {
  console.warn('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are not set. User management will not work.');
}

export async function createUser(user: { email: string; password: string; role: string; employee_id?: string; department?: string }) {
  if (!supabaseAdmin) {
    return { error: 'Supabase admin client not initialized. Check environment variables.' };
  }

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return { error: authError.message };
    }

    // Find employee record if employee_id provided
    let employeeRecordId = null;
    if (user.employee_id) {
      const { data: employeeData, error: empError } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('employee_id', user.employee_id)
        .single();

      if (!empError && employeeData) {
        employeeRecordId = employeeData.id;
      }
    }

    // Create profile
    const profileData = {
      id: authData.user.id,
      email: user.email,
      department: user.department,
      employee_record_id: employeeRecordId,
    };

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Clean up auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { error: profileError.message };
    }

    // Assign role if provided and not 'employee'
    if (user.role && user.role !== 'employee') {
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('name', user.role)
        .single();

      if (!roleError && roleData) {
        const { error: userRoleError } = await supabaseAdmin
          .from('user_roles')
          .insert([{
            user_id: authData.user.id,
            role_id: roleData.id,
          }]);

        if (userRoleError) {
          console.error('Error assigning role:', userRoleError);
        }
      }
    }

    return { data: profile };
  } catch (error: any) {
    console.error('Error creating user:', error);
    return { error: error.message || 'Failed to create user' };
  }
}
