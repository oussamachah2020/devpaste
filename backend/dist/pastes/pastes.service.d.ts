import { PrismaService } from '../prisma/prisma.service';
import { CreatePasteDto } from './dto/create-paste.dto';
import { Cache } from 'cache-manager';
export declare class PastesService {
    private prisma;
    private cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    create(createPasteDto: CreatePasteDto): Promise<{
        password: undefined;
        hasPassword: boolean;
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
    findOne(id: string, password?: string): Promise<{
        id: string;
        title: string | null;
        language: string;
        expiresAt: Date | null;
        burnAfterRead: boolean;
        isPrivate: boolean;
        views: number;
        createdAt: Date;
        updatedAt: Date;
        hasPassword: boolean;
        content: null;
        password: undefined;
    } | {
        password: undefined;
        hasPassword: boolean;
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
        password: string | null;
        language: string;
        burnAfterRead: boolean;
        isPrivate: boolean;
        id: string;
        expiresAt: Date | null;
        hasPassword: boolean;
        views: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
