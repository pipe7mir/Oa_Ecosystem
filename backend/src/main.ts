import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Health check endpoints (before global prefix)
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'OASIS API is running' });
  });
  httpAdapter.get('/api', (req, res) => {
    res.json({ status: 'ok', message: 'OASIS API is running' });
  });
  httpAdapter.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.setGlobalPrefix('api');

  // Dynamic CORS configuration
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://oasis-brown.vercel.app',
    process.env.FRONTEND_URL, // Allow custom frontend URL
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list or matches Vercel pattern
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.railway.app') ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }
      
      // In development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  
  console.log('🚀 Starting OASIS API...');
  console.log(`📡 Port: ${port}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  await app.listen(port, '0.0.0.0');
  console.log(`✅ Server is running on http://0.0.0.0:${port}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
