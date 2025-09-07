import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { setupSwagger } from './swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  app.setGlobalPrefix('api/v1');

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  const configService = app.get(ConfigService);

  const enableCors = configService.get<string>('config.cors')

  const port = process.env.PORT || configService.get<number>('PORT') || 3000;
  
  // Console logs para debug en Railway
  console.log('=== RAILWAY DEBUG INFO ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT from env:', process.env.PORT);
  console.log('PORT from config:', port);
  console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
  console.log('DATABASE_PORT:', process.env.DATABASE_PORT);
  console.log('DATABASE_USER:', process.env.DATABASE_USER);
  console.log('DATABASE_NAME:', process.env.DATABASE_NAME);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('CORS: ENABLED for Netlify');
  console.log('=== GCP CONFIGURATION ===');
  console.log('GCS_PROJECT_ID:', process.env.GCS_PROJECT_ID);
  console.log('GCS_BUCKET_NAME:', process.env.GCS_BUCKET_NAME);
  console.log('GCS_KEY_FILE:', process.env.GCS_KEY_FILE);
  console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  console.log('GCP Project ID from config:', configService.get<string>('config.gcs.projectId'));
  console.log('GCP Bucket from config:', configService.get<string>('config.gcs.bucketName'));
  console.log('GCP Key File from config:', configService.get<string>('config.gcs.keyFile'));
  console.log('========================');

  // Habilitar CORS para Netlify

    // OPCIÓN 1: Wildcard sin credentials (más permisivo)
    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Bearer',
      ],
      credentials: false, // DEBE ser false con origin: '*'
    });
  

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  setupSwagger(app);

  await app.listen(Number(port), '0.0.0.0');
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

void bootstrap();
