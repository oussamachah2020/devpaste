import {
  Injectable,
  NotFoundException,
  Inject,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePasteDto } from './dto/create-paste.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { customAlphabet } from 'nanoid';
import { compare, hash } from 'bcrypt';
const nanoid = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  8,
);

@Injectable()
export class PastesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createPasteDto: CreatePasteDto) {
    const id = nanoid();

    let hashedPassword: string | null = null;

    if (createPasteDto.password) {
      hashedPassword = await hash(createPasteDto.password, 10);
    }

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
        password: hashedPassword,
        hasPassword: !!hashedPassword,
      },
    });

    // Return without password hash
    return {
      ...paste,
      password: undefined,
      hasPassword: !!hashedPassword,
    };
  }

  async findOne(id: string, password?: string) {
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

    // If paste has password but no password provided
    if (paste.password && !password) {
      // Return metadata only (without content)
      return {
        id: paste.id,
        title: paste.title,
        language: paste.language,
        expiresAt: paste.expiresAt,
        burnAfterRead: paste.burnAfterRead,
        isPrivate: paste.isPrivate,
        views: paste.views,
        createdAt: paste.createdAt,
        updatedAt: paste.updatedAt,
        hasPassword: true,
        content: null, // Don't return content
        password: undefined,
      };
    }

    // If paste has password and password is provided, verify it
    if (paste.password && password) {
      const isPasswordValid = await compare(password, paste.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Incorrect password');
      }
    }

    // Increment view count
    await this.prisma.paste.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Cache for 5 minutes (only if not burn after read)
    if (!paste.burnAfterRead) {
      await this.cacheManager.set(`paste:${id}`, paste, 300000);
    }

    // Handle burn after read
    if (paste.burnAfterRead) {
      await this.prisma.paste.delete({ where: { id } });
    }

    // Return full paste without password hash
    return {
      ...paste,
      password: undefined,
      hasPassword: !!paste.password,
    };
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
