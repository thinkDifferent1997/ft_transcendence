import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {


	const httpsOptions = {
	key: fs.readFileSync('/etc/nginx/certs/selfsigned.key'),	
	cert: fs.readFileSync('/etc/nginx/certs/selfsigned.crt'),	
	};
	const app = await NestFactory.create(AppModule, {
		httpsOptions,
	});

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
