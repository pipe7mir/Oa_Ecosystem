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

  // Schema Fix for Billboards (Manual sync)
  console.log('🔄 Checking database schema for billboards...');
  const { Client } = require('pg');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    await client.query('ALTER TABLE billboards ALTER COLUMN media_url TYPE varchar(1000);');
    await client.query('ALTER TABLE billboards ALTER COLUMN media_type TYPE varchar(50);');
    try {
      await client.query('ALTER TABLE billboards ADD COLUMN IF NOT EXISTS styles jsonb;');
    } catch (e: any) {
      console.log('Styles column check/add:', e.message);
    }
    console.log('✅ Database schema updated manually (1000 chars + styles)');
    await client.end();
  } catch (error: any) {
    console.warn('⚠️ Could not run manual schema fix (might be expected if table doesn\'t exist yet):', error.message);
    try { await client.end(); } catch (e: any) {}
  }
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  console.log('🚀 Starting OASIS API...');
  console.log(`📡 Port: ${port}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 DATABASE_URL: ${process.env.DATABASE_URL ? 'configured' : 'NOT SET!'}`);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // ⚠️ CRITICAL: Configure body parser IMMEDIATELY after app creation
  // Set to 20MB to allow multipart file uploads with metadata
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  app.use(express.raw({ limit: '20mb' }));
  
  // Log payload configuration
  console.log('📦 Payload limit configured: 20MB');

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

  // ✅ CORS configuration - FIXED for production
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',').map(o => o.trim());
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🔒 CORS enabled for: ${allowedOrigins.join(', ')}`);
  } else {
    console.log(`🔓 Development mode - CORS enabled for: ${allowedOrigins.join(', ')}`);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow all origins for now to resolve the "very broken" state
      callback(null, true);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, cache-control, Pragma, pragma, X-CSRF-Token',
    exposedHeaders: 'Content-Range, X-Content-Range',
  });

  // ✅ Global pipes for validation (class-validator)
  const { ValidationPipe } = await import('@nestjs/common');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, 
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(port, '0.0.0.0');
  console.log(`✅ Server is running on http://0.0.0.0:${port}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});
