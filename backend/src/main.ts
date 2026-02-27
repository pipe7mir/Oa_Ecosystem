import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`📁 Created uploads directory at: ${uploadsDir}`);
  }
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  console.log('🚀 Starting OASIS API...');
  console.log(`📡 Port: ${port}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 DATABASE_URL: ${process.env.DATABASE_URL ? 'configured' : 'NOT SET!'}`);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Configure body parser with 10MB limit for base64 images
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoints BEFORE global prefix
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req: any, res: any) => {
    res.json({ status: 'ok', message: 'OASIS API is running' });
  });
  httpAdapter.get('/health', (req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.setGlobalPrefix('api');

  // Add /api health check AFTER global prefix is set
  httpAdapter.get('/api', (req: any, res: any) => {
    res.json({ status: 'ok', message: 'OASIS API is running' });
  });

  // CORS configuration
  app.enableCors({
    origin: true, // Allow all origins for now
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  });

  await app.listen(port, '0.0.0.0');
  console.log(`✅ Server is running on http://0.0.0.0:${port}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});
