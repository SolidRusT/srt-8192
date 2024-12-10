import { createServer } from './server';

const PORT = process.env.PORT || 5001;

async function start() {
  try {
    const app = await createServer();
    app.listen(PORT, () => {
      console.log(`Game Logic Service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
