import dotenv from 'dotenv';
import app from './app';
import { closeBrowser } from './services/scraper/utils/browser';

dotenv.config();

// Validate required environment variables at startup, env variables not checked here are ones with fallback values.
const requiredEnvVars = ['JWT_SECRET', 'JWT_EXPIRES_IN'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please set the following environment variables and restart the server:');
  missingEnvVars.forEach(envVar => {
    console.error(`  - ${envVar}`);
  });
  process.exit(1);
}

const PORT = process.env['PORT'] || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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