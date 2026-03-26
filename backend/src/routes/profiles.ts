import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { profileSchema } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/profiles
router.get('/', async (req: Request, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!profile) {
      res.json(null);
      return;
    }

    res.json({
      id: profile.id,
      user_id: profile.userId,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      medical_history: JSON.parse(profile.medicalHistory),
      created_at: profile.createdAt.toISOString(),
      updated_at: profile.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profiles
router.put('/', async (req: Request, res: Response) => {
  try {
    const data = profileSchema.parse(req.body);

    const profile = await prisma.profile.upsert({
      where: { userId: req.user!.userId },
      update: {
        name: data.name,
        age: data.age,
        gender: data.gender,
        medicalHistory: JSON.stringify(data.medical_history || []),
      },
      create: {
        userId: req.user!.userId,
        name: data.name || '',
        age: data.age || 0,
        gender: data.gender || 'Others',
        medicalHistory: JSON.stringify(data.medical_history || []),
      },
    });

    res.json({
      id: profile.id,
      user_id: profile.userId,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      medical_history: JSON.parse(profile.medicalHistory),
      created_at: profile.createdAt.toISOString(),
      updated_at: profile.updatedAt.toISOString(),
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
