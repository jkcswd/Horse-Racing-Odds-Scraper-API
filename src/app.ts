import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import oddsRoutes from './routes/odds.routes';
import logger from './utils/logger';

const app = express();

// Simple, industry standard security although a lot of it is not needed for our use case
app.use(helmet()); 

app.use(cors({
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  credentials: true
}));

// Request parsing - JSON only. 10kb is generous for URL payloads
app.use(express.json({ limit: '10kb' }));

// Custom HTTP logging with Winston we want to keep it in JSON format for easy parsing by log management systems
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      type: 'http_request'
    });
  });
  
  next();
});

// Routes
app.use('/api', oddsRoutes);

// 404 handler
app.use('*', (req, res) => {
  logger.error('Route not found', { url: req.originalUrl, method: req.method });
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling
app.use((error: any, req: express.Request, res: express.Response) => {
  logger.error('Unhandled error', {
    error: error.message || error,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method
  });
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env['NODE_ENV'] === 'development' ? error.message : 'Something went wrong'
  });
});

export default app;