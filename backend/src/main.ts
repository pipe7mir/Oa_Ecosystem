import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Health check endpoint at root (before global prefix)
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({ status: 'ok', message: 'OASIS API is running' });
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
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Nest server running on port ${port}`);
}

bootstrap();
