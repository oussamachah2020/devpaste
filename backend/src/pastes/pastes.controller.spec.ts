import { Test, TestingModule } from '@nestjs/testing';
import { PastesController } from './pastes.controller';
import { PastesService } from './pastes.service';

describe('PastesController', () => {
  let controller: PastesController;

  const mockPastesService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PastesController],
      providers: [
        {
          provide: PastesService,
          useValue: mockPastesService,
        },
      ],
    }).compile();

    controller = module.get<PastesController>(PastesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});