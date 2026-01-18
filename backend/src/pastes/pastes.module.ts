import { Module } from '@nestjs/common';
import { PastesService } from './pastes.service';
import { PastesController } from './pastes.controller';

@Module({
  providers: [PastesService],
  controllers: [PastesController]
})
export class PastesModule {}
