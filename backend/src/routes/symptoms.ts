import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { symptomSchema } from '../utils/validation';

const router = Router();
router.use(authenticate);

function formatSymptom(symptom: any) {
  return {
    id: symptom.id,
    user_id: symptom.userId,
    symptom_type: symptom.symptomType,
    severity: symptom.severity,
    description: symptom.description,
    date: symptom.date,
    time: symptom.time,
    created_at: symptom.createdAt.toISOString(),
  };
}

// GET /api/symptoms?date=YYYY-MM-DD
// GET /api/symptoms?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
// GET /api/symptoms (all)
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

    const symptoms = await prisma.symptom.findMany({
      where,
      orderBy: date ? { createdAt: 'desc' } : { date: startDate ? 'asc' : 'desc' },
    });

    res.json(symptoms.map(formatSymptom));
  } catch (error) {
    console.error('Get symptoms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/symptoms
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = symptomSchema.parse(req.body);

    const symptom = await prisma.symptom.create({
      data: {
        userId: req.user!.userId,
        symptomType: data.symptom_type,
        severity: data.severity,
        description: data.description,
        date: data.date,
        time: data.time,
      },
    });

    res.status(201).json(formatSymptom(symptom));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Create symptom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/symptoms/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = symptomSchema.parse(req.body);

    const existing = await prisma.symptom.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Symptom not found' });
      return;
    }

    const symptom = await prisma.symptom.update({
      where: { id },
      data: {
        symptomType: data.symptom_type,
        severity: data.severity,
        description: data.description,
        date: data.date,
        time: data.time,
      },
    });

    res.json(formatSymptom(symptom));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Update symptom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/symptoms/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.symptom.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Symptom not found' });
      return;
    }

    await prisma.symptom.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete symptom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
