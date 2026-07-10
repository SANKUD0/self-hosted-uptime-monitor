import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // Adjust this to your frontend URL
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that doesn't have in the DTO
    transform: true, // Automatically transform Json instance into their DTO classes
    forbidNonWhitelisted: true, // Reject if unknown properties are sent
  }))

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
