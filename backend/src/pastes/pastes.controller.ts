import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PastesService } from './pastes.service';
import { CreatePasteDto } from './dto/create-paste.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VerifyPasswordDto } from './dto/verify-password.dto';

@ApiTags('pastes')
@Controller('pastes')
export class PastesController {
  constructor(private readonly pastesService: PastesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new paste' })
  create(@Body(ValidationPipe) createPasteDto: CreatePasteDto) {
    return this.pastesService.create(createPasteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get recent public pastes' })
  findAll(@Query('limit') limit?: string) {
    return this.pastesService.findAll(limit ? parseInt(limit) : 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a paste by ID' })
  findOne(@Param('id') id: string) {
    return this.pastesService.findOne(id);
  }

  @Post(':id')
  @ApiOperation({ summary: 'Unlock paste with password' })
  @HttpCode(HttpStatus.OK)
  async findOneWithPassword(
    @Param('id') id: string,
    @Body() verifyPasswordDto: VerifyPasswordDto,
  ) {
    return this.pastesService.findOne(id, verifyPasswordDto.password);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a paste' })
  delete(@Param('id') id: string) {
    return this.pastesService.delete(id);
  }
}
