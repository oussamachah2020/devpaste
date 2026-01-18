import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { redisStore } from 'cache-manager-redis-yet';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PastesModule } from './pastes/pastes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT!) || 6379,
          },
        }),
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 10,  // 10 requests per minute
    }]),
    PrismaModule,
    PastesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
