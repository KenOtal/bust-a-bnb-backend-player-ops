import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({credentials: true, origin: "http://localhost:3000"});

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT || 3555);
}
bootstrap();
