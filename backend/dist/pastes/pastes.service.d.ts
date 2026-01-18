import { PrismaService } from '../prisma/prisma.service';
import { CreatePasteDto } from './dto/create-paste.dto';
import { Cache } from 'cache-manager';
export declare class PastesService {
    private prisma;
    private cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    create(createPasteDto: CreatePasteDto): Promise<{
        title: string | null;
        content: string;
        language: string;
        burnAfterRead: boolean;
        isPrivate: boolean;
        id: string;
        expiresAt: Date | null;
        views: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOne(id: string): Promise<{}>;
    findAll(limit?: number): Promise<{
        title: string | null;
        language: string;
        id: string;
        expiresAt: Date | null;
        views: number;
        createdAt: Date;
    }[]>;
    delete(id: string): Promise<{
        title: string | null;
        content: string;
        language: string;
        burnAfterRead: boolean;
        isPrivate: boolean;
        id: string;
        expiresAt: Date | null;
        views: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
