import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();
router.use(authenticate);

function getAnthropicClient(): Anthropic | null {
  if (!env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

// POST /api/recommendations
// Generate AI-powered meal recommendations based on user's history
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const client = getAnthropicClient();

    if (!client) {
      res.status(503).json({
        error: 'AI recommendations are not configured. Set ANTHROPIC_API_KEY in environment.',
      });
      return;
    }

    // Fetch recent user data (last 14 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDateObj = new Date();
    startDateObj.setDate(startDateObj.getDate() - 14);
    const startDate = startDateObj.toISOString().split('T')[0];

    const [meals, symptoms, moods, profile] = await Promise.all([
      prisma.meal.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
        orderBy: { date: 'desc' },
      }),
      prisma.symptom.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
        orderBy: { date: 'desc' },
      }),
      prisma.mood.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
        orderBy: { date: 'desc' },
      }),
      prisma.profile.findFirst({ where: { userId } }),
    ]);

    // Build context for Claude
    const mealSummary = meals.map(m => {
      let ingredients: string[] = [];
      try { ingredients = JSON.parse(m.ingredients); } catch {}
      return `${m.date}: ${m.name} (${m.mealTime}) - ingredients: ${ingredients.join(', ')}`;
    }).join('\n');
    const symptomSummary = symptoms.map(s => `${s.date}: ${s.symptomType} (severity ${s.severity}/10) - ${s.description || 'no details'}`).join('\n');
    const moodSummary = moods.map(m => `${m.date}: ${m.moodType} (score ${m.moodScore}/5, energy ${m.energyLevel ?? 'N/A'}/10)`).join('\n');

    let medicalHistory: string[] = [];
    if (profile) {
      try { medicalHistory = JSON.parse(profile.medicalHistory); } catch {}
    }
    const profileContext = profile
      ? `User profile: ${profile.name || 'Unknown'}, age ${profile.age || 'unknown'}, gender ${profile.gender || 'unknown'}, medical history: ${medicalHistory.join(', ') || 'none'}`
      : 'No profile information available.';

    const userPrompt = req.body.prompt || 'Give me meal recommendations for today.';

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are a nutrition advisor for the MoodMeal app. Based on the user's recent meal history, symptoms, and mood patterns, provide personalized meal recommendations. Focus on:
1. Foods that may help improve their mood and energy
2. Avoiding ingredients correlated with their symptoms
3. Balanced nutrition appropriate for their profile
4. Simple, practical meal suggestions

Be concise and friendly. Format recommendations as a list with brief explanations. If you notice patterns between foods and symptoms, mention them.

${profileContext}

Recent meals (last 14 days):
${mealSummary || 'No meals logged yet.'}

Recent symptoms:
${symptomSummary || 'No symptoms logged.'}

Recent moods:
${moodSummary || 'No moods logged.'}`,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    res.json({
      recommendation: responseText,
      dataUsed: {
        mealsCount: meals.length,
        symptomsCount: symptoms.length,
        moodsCount: moods.length,
      },
    });
  } catch (error: any) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// GET /api/recommendations/recipes?query=...
// Search for recipe suggestions based on a query
router.get('/recipes', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const userId = req.user!.userId;
    const client = getAnthropicClient();

    if (!client) {
      res.status(503).json({ error: 'AI not configured.' });
      return;
    }

    if (!query) {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }

    // Fetch user symptoms to avoid problematic ingredients
    const symptoms = await prisma.symptom.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 20,
    });

    const symptomContext = symptoms.length > 0
      ? `The user has experienced these symptoms recently: ${symptoms.map(s => `${s.symptomType} (severity ${s.severity})`).join(', ')}. Avoid ingredients that might trigger these.`
      : '';

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are a recipe assistant for the MoodMeal app. Provide simple, healthy recipes that are easy to make. ${symptomContext}

Return exactly 3 recipes in this JSON format (no markdown, just raw JSON):
[{"name":"Recipe Name","description":"Brief description","ingredients":["ingredient1","ingredient2"],"instructions":"Step-by-step instructions","prepTime":"15 min","tags":["healthy","quick"]}]`,
      messages: [{ role: 'user', content: query }],
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    try {
      const recipes = JSON.parse(text);
      res.json({ recipes });
    } catch {
      // If JSON parsing fails, return raw text
      res.json({ recipes: [], rawResponse: text });
    }
  } catch (error: any) {
    console.error('Recipe search error:', error);
    res.status(500).json({ error: 'Failed to search recipes' });
  }
});

export default router;
