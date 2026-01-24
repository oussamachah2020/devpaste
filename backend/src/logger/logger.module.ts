import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Global() // Make it available everywhere
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
