import dotenv from 'dotenv';
import app from './app';
import { closeBrowser } from './services/scraper/utils/browser';

dotenv.config();

const PORT = process.env['PORT'] || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  if (process.env['NODE_ENV'] !== 'production') {
    console.log(`Test token: http://localhost:${PORT}/api/test-token`);
  }
});

const gracefulShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('HTTP server closed');

    try {
      await closeBrowser();
      console.log('Browser closed');
    } catch (error) {
      console.error('Error closing browser:', error);
    }

    console.log('Graceful shutdown completed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;