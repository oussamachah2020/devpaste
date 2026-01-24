import { PastesService } from './pastes.service';
import { CreatePasteDto } from './dto/create-paste.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
export declare class PastesController {
    private readonly pastesService;
    constructor(pastesService: PastesService);
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
    findAll(limit?: string): Promise<{
        title: string | null;
        language: string;
        id: string;
        expiresAt: Date | null;
        views: number;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<any>;
    findOneWithPassword(id: string, verifyPasswordDto: VerifyPasswordDto): Promise<any>;
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
