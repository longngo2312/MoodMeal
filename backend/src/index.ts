import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profiles';
import mealRoutes from './routes/meals';
import symptomRoutes from './routes/symptoms';
import moodRoutes from './routes/moods';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/moods', moodRoutes);

// Start server
async function start() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`MoodMeal API running on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

start().catch(console.error);
