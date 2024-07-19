import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = 3007;
  const host = 'localhost';

  await app.listen(port, () =>
    logger.log(`Server is running on http://${host}:${port}`),
  );
}
bootstrap();
