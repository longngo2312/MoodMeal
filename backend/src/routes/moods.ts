import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { moodSchema } from '../utils/validation';

const router = Router();
router.use(authenticate);

function formatMood(mood: any) {
  return {
    id: mood.id,
    user_id: mood.userId,
    mood_type: mood.moodType,
    mood_score: mood.moodScore,
    emoji: mood.emoji,
    notes: mood.notes,
    energy_level: mood.energyLevel,
    date: mood.date,
    time: mood.time,
    created_at: mood.createdAt.toISOString(),
  };
}

// GET /api/moods?date=YYYY-MM-DD
// GET /api/moods?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
// GET /api/moods (all)
router.get('/', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    const startDate = req.query.start_date as string | undefined;
    const endDate = req.query.end_date as string | undefined;
    const userId = req.user!.userId;

    let where: any = { userId };

    if (date) {
      where.date = date;
    } else if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate };
    }

    const moods = await prisma.mood.findMany({
      where,
      orderBy: date ? { createdAt: 'desc' } : { date: startDate ? 'asc' : 'desc' },
    });

    res.json(moods.map(formatMood));
  } catch (error) {
    console.error('Get moods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/moods
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = moodSchema.parse(req.body);

    const mood = await prisma.mood.create({
      data: {
        userId: req.user!.userId,
        moodType: data.mood_type,
        moodScore: data.mood_score,
        emoji: data.emoji,
        notes: data.notes,
        energyLevel: data.energy_level ?? null,
        date: data.date,
        time: data.time,
      },
    });

    res.status(201).json(formatMood(mood));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Create mood error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/moods/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = moodSchema.parse(req.body);

    const existing = await prisma.mood.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Mood not found' });
      return;
    }

    const mood = await prisma.mood.update({
      where: { id },
      data: {
        moodType: data.mood_type,
        moodScore: data.mood_score,
        emoji: data.emoji,
        notes: data.notes,
        energyLevel: data.energy_level ?? null,
        date: data.date,
        time: data.time,
      },
    });

    res.json(formatMood(mood));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Update mood error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/moods/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.mood.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Mood not found' });
      return;
    }

    await prisma.mood.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete mood error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
