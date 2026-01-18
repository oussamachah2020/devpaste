import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePasteDto } from './dto/create-paste.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

@Injectable()
export class PastesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createPasteDto: CreatePasteDto) {
    const id = nanoid();
    
    // Calculate expiration time
    let expiresAt: Date | null = null;
    if (createPasteDto.expiresIn) {
      const now = new Date();
      switch (createPasteDto.expiresIn) {
        case '1hour':
          expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
          break;
        case '1day':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case '1week':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    const paste = await this.prisma.paste.create({
      data: {
        id,
        title: createPasteDto.title,
        content: createPasteDto.content,
        language: createPasteDto.language || 'plaintext',
        expiresAt,
        burnAfterRead: createPasteDto.burnAfterRead || false,
        isPrivate: createPasteDto.isPrivate || false,
      },
    });

    return paste;
  }

  async findOne(id: string) {
    // Try to get from cache first
    const cached = await this.cacheManager.get(`paste:${id}`);
    if (cached) {
      return cached;
    }

    const paste = await this.prisma.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      throw new NotFoundException('Paste not found');
    }

    // Check if expired
    if (paste.expiresAt && paste.expiresAt < new Date()) {
      await this.prisma.paste.delete({ where: { id } });
      throw new NotFoundException('Paste has expired');
    }

    // Increment view count
    await this.prisma.paste.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Cache for 5 minutes
    await this.cacheManager.set(`paste:${id}`, paste, 300000);

    // Handle burn after read
    if (paste.burnAfterRead) {
      await this.prisma.paste.delete({ where: { id } });
    }

    return paste;
  }

  async findAll(limit = 20) {
    return this.prisma.paste.findMany({
      where: {
        isPrivate: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        title: true,
        language: true,
        views: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  }

  async delete(id: string) {
    await this.cacheManager.del(`paste:${id}`);
    return this.prisma.paste.delete({ where: { id } });
  }
}