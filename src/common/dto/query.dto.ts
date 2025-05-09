import { IsOptional, IsString, IsEnum, IsArray, IsIn, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Field to sort by' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;

  @ApiPropertyOptional({ description: 'Search term for text fields' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Fields to search in', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchFields?: string[];

  @ApiPropertyOptional({ description: 'Fields to select', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  select?: string[];

  @ApiPropertyOptional({ description: 'Filter conditions', type: Object })
  @IsOptional()
  @IsObject()
  filter?: Record<string, any>;
} 