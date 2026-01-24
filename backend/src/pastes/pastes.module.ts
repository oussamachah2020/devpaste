import { Module } from '@nestjs/common';
import { PastesService } from './pastes.service';
import { PastesController } from './pastes.controller';
import { MetricsModule } from 'src/metrics/metrics.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, MetricsModule],
  providers: [PastesService],
  controllers: [PastesController],
})
export class PastesModule {}
