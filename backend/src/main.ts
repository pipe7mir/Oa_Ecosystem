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

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Body parser configuration
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  
  // Health checks
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req: any, res: any) => {
    res.json({ status: 'ok', message: 'OASIS API is running' });
  });

  app.setGlobalPrefix('api');

  // CORS - ALLOW ALL ORIGINS temporarily to resolve the "very broken" status
  app.enableCors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, cache-control, Pragma, pragma, X-CSRF-Token',
    exposedHeaders: 'Content-Range, X-Content-Range',
  });

  // Global pipes
  const { ValidationPipe } = await import('@nestjs/common');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, 
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on: http://0.0.0.0:${port}/api`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});
