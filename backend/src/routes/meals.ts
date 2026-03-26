import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { mealSchema } from '../utils/validation';

const router = Router();
router.use(authenticate);

function formatMeal(meal: any) {
  return {
    id: meal.id,
    user_id: meal.userId,
    name: meal.name,
    description: meal.description,
    ingredients: JSON.parse(meal.ingredients),
    meal_time: meal.mealTime,
    date: meal.date,
    created_at: meal.createdAt.toISOString(),
  };
}

// GET /api/meals?date=YYYY-MM-DD
// GET /api/meals?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
// GET /api/meals (all)
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

    const meals = await prisma.meal.findMany({
      where,
      orderBy: date ? { createdAt: 'desc' } : { date: startDate ? 'asc' : 'desc' },
    });

    res.json(meals.map(formatMeal));
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/meals
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = mealSchema.parse(req.body);

    const meal = await prisma.meal.create({
      data: {
        userId: req.user!.userId,
        name: data.name,
        description: data.description,
        ingredients: JSON.stringify(data.ingredients),
        mealTime: data.meal_time,
        date: data.date,
      },
    });

    res.status(201).json(formatMeal(meal));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Create meal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/meals/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = mealSchema.parse(req.body);

    const existing = await prisma.meal.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    const meal = await prisma.meal.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        ingredients: JSON.stringify(data.ingredients),
        mealTime: data.meal_time,
        date: data.date,
      },
    });

    res.json(formatMeal(meal));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('Update meal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/meals/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.meal.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    await prisma.meal.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
