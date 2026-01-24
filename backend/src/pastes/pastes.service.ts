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
import { MetricsService } from '../metrics/metrics.service';
import { LoggerService } from 'src/logger/logger.service';

const nanoid = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  8,
);

@Injectable()
export class PastesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private metricsService: MetricsService,
    private logger: LoggerService,
  ) {}

  async create(createPasteDto: CreatePasteDto) {
    const startTime = Date.now();

    try {
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

      // Record database query metrics
      const duration = (Date.now() - startTime) / 1000;
      this.metricsService.incrementDbQuery('create', 'paste');
      this.metricsService.observeDbQueryDuration('create', 'paste', duration);

      // Record paste creation metrics
      this.metricsService.incrementPasteCreated(
        paste.language,
        !!hashedPassword,
        paste.isPrivate,
        paste.burnAfterRead,
      );

      this.logger.log(`Paste created: ${paste.id}`, 'PastesService');

      // Return without password hash
      return {
        ...paste,
        password: undefined,
        hasPassword: !!hashedPassword,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create paste: ${error.message}`,
        error.stack,
        'PastesService',
      );
      this.metricsService.incrementError('database_error', 'create_paste');
      throw error;
    }
  }

  async findOne(id: string, password?: string) {
    const startTime = Date.now();

    try {
      // Try cache first
      const cacheKey = `paste:${id}`;
      const cached = await this.cacheManager.get(cacheKey);

      if (cached) {
        this.metricsService.incrementCacheHit(cacheKey);
        const paste = cached as any;

        // Still need to check password for cached pastes
        if (paste.password && !password) {
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
            content: null,
            password: undefined,
          };
        }

        if (paste.password && password) {
          const isPasswordValid = await compare(password, paste.password);
          if (!isPasswordValid) {
            throw new UnauthorizedException('Incorrect password');
          }
        }

        // Track paste view
        this.metricsService.incrementPasteViewed(
          paste.language,
          !!paste.password,
        );

        return {
          ...paste,
          password: undefined,
          hasPassword: !!paste.password,
        };
      }

      // Cache miss
      this.metricsService.incrementCacheMiss(cacheKey);

      const paste = await this.prisma.paste.findUnique({
        where: { id },
      });

      // Record database query metrics
      const duration = (Date.now() - startTime) / 1000;
      this.metricsService.incrementDbQuery('findUnique', 'paste');
      this.metricsService.observeDbQueryDuration(
        'findUnique',
        'paste',
        duration,
      );

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

      // Track paste view metrics
      this.metricsService.incrementPasteViewed(
        paste.language,
        !!paste.password,
      );

      // Cache for 5 minutes (only if not burn after read)
      if (!paste.burnAfterRead) {
        await this.cacheManager.set(cacheKey, paste, 300000);
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
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.metricsService.incrementError('database_error', 'find_paste');
      throw error;
    }
  }

  async findAll(limit = 20) {
    const startTime = Date.now();

    try {
      const pastes = await this.prisma.paste.findMany({
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

      // Record database query metrics
      const duration = (Date.now() - startTime) / 1000;
      this.metricsService.incrementDbQuery('findMany', 'paste');
      this.metricsService.observeDbQueryDuration('findMany', 'paste', duration);

      return pastes;
    } catch (error) {
      this.metricsService.incrementError('database_error', 'find_all_pastes');
      throw error;
    }
  }

  async delete(id: string) {
    const startTime = Date.now();

    try {
      await this.cacheManager.del(`paste:${id}`);

      const paste = await this.prisma.paste.delete({ where: { id } });

      // Record database query metrics
      const duration = (Date.now() - startTime) / 1000;
      this.metricsService.incrementDbQuery('delete', 'paste');
      this.metricsService.observeDbQueryDuration('delete', 'paste', duration);

      return paste;
    } catch (error) {
      this.metricsService.incrementError('database_error', 'delete_paste');
      throw error;
    }
  }
}