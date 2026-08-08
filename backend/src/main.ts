import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';

async function bootstrap() {
  let app: INestApplication;

  try {
    const httpsOptions = {
      key: fs.readFileSync('/etc/nginx/certs/selfsigned.key'),
      cert: fs.readFileSync('/etc/nginx/certs/selfsigned.crt'),
    };
    app = await NestFactory.create(AppModule, { httpsOptions });
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    console.warn('⚠️ Mode HTTP simple de secours activé :', reason);
    app = await NestFactory.create(AppModule);
  }

  app.setGlobalPrefix('api', { exclude: ['metrics'] }); // i had to exclude metrics, so its not exposed to the public
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
