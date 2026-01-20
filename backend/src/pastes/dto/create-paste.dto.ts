import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreatePasteDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  @IsIn([
    'plaintext',
    'javascript',
    'typescript',
    'python',
    'java',
    'go',
    'rust',
    'cpp',
    'html',
    'css',
    'json',
    'sql',
    'bash',
    'markdown',
  ])
  language?: string;

  @IsOptional()
  @IsIn(['1hour', '1day', '1week', 'never'])
  expiresIn?: string;

  @IsOptional()
  @IsBoolean()
  burnAfterRead?: boolean;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}