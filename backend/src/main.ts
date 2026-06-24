import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
      // TLS is terminated at the nginx reverse proxy. The backend speaks plain
      // HTTP on the internal Docker network and is never published to the host,
      // so all client-facing traffic is still HTTPS.
      const app = await NestFactory.create(AppModule);

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
