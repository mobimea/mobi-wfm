import express, { Request, Response } from 'express';
import { createUser } from './userManagement';

const router = express.Router();

// POST /api/users - create a new user
router.post('/users', async (req: Request, res: Response) => {
  const { email, password, role, employee_id, department } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields: email, password, role' });
  }

  try {
    const result = await createUser({ email, password, role, employee_id, department });

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(201).json({ user: result.data });
  } catch (error: any) {
    console.error('Error in user creation API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
