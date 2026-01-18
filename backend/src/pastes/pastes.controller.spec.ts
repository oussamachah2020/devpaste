import { Test, TestingModule } from '@nestjs/testing';
import { PastesController } from './pastes.controller';

describe('PastesController', () => {
  let controller: PastesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PastesController],
    }).compile();

    controller = module.get<PastesController>(PastesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
