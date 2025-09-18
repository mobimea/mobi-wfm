import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Load service_role key from environment variables (ensure this is set securely in your backend environment)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Create user endpoint
router.post('/users', async (req, res) => {
  try {
    const { email, password, role, employee_id, department } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    // Check if user already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingProfile) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return res.status(400).json({ error: authError.message });
    }

    // Find employee record if employee_id provided
    let employeeRecordId = null;
    if (employee_id) {
      const { data: employeeData, error: empError } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('employee_id', employee_id)
        .single();

      if (!empError && employeeData) {
        employeeRecordId = employeeData.id;
      }
    }

    // Create profile
    const profileData = {
      id: authData.user.id,
      email,
      department,
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
      return res.status(400).json({ error: profileError.message });
    }

    // Assign role if provided and not 'employee'
    if (role && role !== 'employee') {
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('name', role)
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

    res.status(201).json({ data: profile });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message || 'Failed to create user' });
  }
});

// Get users endpoint
router.get('/users', async (req, res) => {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        user_roles (
          roles (
            name
          )
        )
      `);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data: profiles });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

// Update user endpoint
router.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ data: profile });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message || 'Failed to update user' });
  }
});

// Delete user endpoint
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete from profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    // Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting auth user:', authError);
      return res.status(400).json({ error: authError.message });
    }

    res.json({ data: { success: true } });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
});

export default router;
