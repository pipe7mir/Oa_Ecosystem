import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@codegenie/serverless-express';
import express from 'express';

let cachedServer: any;

async function bootstrap() {
    if (!cachedServer) {
        const expressApp = express();
        const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

        app.setGlobalPrefix('api');

        app.enableCors({
            origin: [
                'http://localhost:5173',
                'https://oasis-brown.vercel.app',
                /\.vercel\.app$/,
            ],
            credentials: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
        });

        await app.init();
        cachedServer = serverlessExpress({ app: expressApp });
    }
    return cachedServer;
}

export default async function handler(req: any, res: any) {
    const server = await bootstrap();
    return server(req, res);
}
