"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PastesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cache_manager_1 = require("@nestjs/cache-manager");
const nanoid_1 = require("nanoid");
const bcrypt_1 = require("bcrypt");
const metrics_service_1 = require("../metrics/metrics.service");
const logger_service_1 = require("../logger/logger.service");
const nanoid = (0, nanoid_1.customAlphabet)('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
let PastesService = class PastesService {
    prisma;
    cacheManager;
    metricsService;
    logger;
    constructor(prisma, cacheManager, metricsService, logger) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
        this.metricsService = metricsService;
        this.logger = logger;
    }
    async create(createPasteDto) {
        const startTime = Date.now();
        try {
            const id = nanoid();
            let hashedPassword = null;
            if (createPasteDto.password) {
                hashedPassword = await (0, bcrypt_1.hash)(createPasteDto.password, 10);
            }
            let expiresAt = null;
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
            const duration = (Date.now() - startTime) / 1000;
            this.metricsService.incrementDbQuery('create', 'paste');
            this.metricsService.observeDbQueryDuration('create', 'paste', duration);
            this.metricsService.incrementPasteCreated(paste.language, !!hashedPassword, paste.isPrivate, paste.burnAfterRead);
            this.logger.log(`Paste created: ${paste.id}`, 'PastesService');
            return {
                ...paste,
                password: undefined,
                hasPassword: !!hashedPassword,
            };
        }
        catch (error) {
            this.logger.error(`Failed to create paste: ${error.message}`, error.stack, 'PastesService');
            this.metricsService.incrementError('database_error', 'create_paste');
            throw error;
        }
    }
    async findOne(id, password) {
        const startTime = Date.now();
        try {
            const cacheKey = `paste:${id}`;
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                this.metricsService.incrementCacheHit(cacheKey);
                const paste = cached;
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
                    const isPasswordValid = await (0, bcrypt_1.compare)(password, paste.password);
                    if (!isPasswordValid) {
                        throw new common_1.UnauthorizedException('Incorrect password');
                    }
                }
                this.metricsService.incrementPasteViewed(paste.language, !!paste.password);
                return {
                    ...paste,
                    password: undefined,
                    hasPassword: !!paste.password,
                };
            }
            this.metricsService.incrementCacheMiss(cacheKey);
            const paste = await this.prisma.paste.findUnique({
                where: { id },
            });
            const duration = (Date.now() - startTime) / 1000;
            this.metricsService.incrementDbQuery('findUnique', 'paste');
            this.metricsService.observeDbQueryDuration('findUnique', 'paste', duration);
            if (!paste) {
                throw new common_1.NotFoundException('Paste not found');
            }
            if (paste.expiresAt && paste.expiresAt < new Date()) {
                await this.prisma.paste.delete({ where: { id } });
                throw new common_1.NotFoundException('Paste has expired');
            }
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
                const isPasswordValid = await (0, bcrypt_1.compare)(password, paste.password);
                if (!isPasswordValid) {
                    throw new common_1.UnauthorizedException('Incorrect password');
                }
            }
            await this.prisma.paste.update({
                where: { id },
                data: { views: { increment: 1 } },
            });
            this.metricsService.incrementPasteViewed(paste.language, !!paste.password);
            if (!paste.burnAfterRead) {
                await this.cacheManager.set(cacheKey, paste, 300000);
            }
            if (paste.burnAfterRead) {
                await this.prisma.paste.delete({ where: { id } });
            }
            return {
                ...paste,
                password: undefined,
                hasPassword: !!paste.password,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.UnauthorizedException) {
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
            const duration = (Date.now() - startTime) / 1000;
            this.metricsService.incrementDbQuery('findMany', 'paste');
            this.metricsService.observeDbQueryDuration('findMany', 'paste', duration);
            return pastes;
        }
        catch (error) {
            this.metricsService.incrementError('database_error', 'find_all_pastes');
            throw error;
        }
    }
    async delete(id) {
        const startTime = Date.now();
        try {
            await this.cacheManager.del(`paste:${id}`);
            const paste = await this.prisma.paste.delete({ where: { id } });
            const duration = (Date.now() - startTime) / 1000;
            this.metricsService.incrementDbQuery('delete', 'paste');
            this.metricsService.observeDbQueryDuration('delete', 'paste', duration);
            return paste;
        }
        catch (error) {
            this.metricsService.incrementError('database_error', 'delete_paste');
            throw error;
        }
    }
};
exports.PastesService = PastesService;
exports.PastesService = PastesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object, metrics_service_1.MetricsService,
        logger_service_1.LoggerService])
], PastesService);
//# sourceMappingURL=pastes.service.js.map