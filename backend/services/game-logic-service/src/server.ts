import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { createClient } from 'redis';
import { EventEmitter } from 'events';
import { createGameRoutes } from './api/routes';
import { GameService } from './GameService';

export async function createServer() {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());

  // Connect to MongoDB
  const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  await mongoClient.connect();

  // Connect to Redis
  const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  await redisClient.connect();

  // Create event emitter
  const eventEmitter = new EventEmitter();

  // Create game service
  const gameService = new GameService(mongoClient, redisClient, eventEmitter);

  // Set up routes
  app.use('/api', createGameRoutes(gameService));

  // Error handling
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await gameService.shutdown();
    await mongoClient.close();
    await redisClient.quit();
    process.exit(0);
  });

  return app;
}
