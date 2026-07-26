import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';

async function bootstrap() {
    let app;

    try {
        const httpsOptions = {
            key: fs.readFileSync('/etc/nginx/certs/selfsigned.key'),
            cert: fs.readFileSync('/etc/nginx/certs/selfsigned.crt'),
        };
        app = await NestFactory.create(AppModule, { httpsOptions });
    } catch (e) {
        console.warn("⚠️ Mode HTTP simple de secours activé :", e.message);
        app = await NestFactory.create(AppModule);
    }

    app.setGlobalPrefix('api');

    app.use(cookieParser());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.listen(3000);
}
bootstrap();
