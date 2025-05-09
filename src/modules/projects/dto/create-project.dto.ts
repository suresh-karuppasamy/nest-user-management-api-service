import { IsString, IsNotEmpty, IsOptional, IsArray, IsDate, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Redesign' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Redesign the company website with modern UI/UX' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: '2024-03-01' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ example: '2024-06-30' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.PLANNING })
  @IsNotEmpty()
  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @ApiPropertyOptional({ example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teamMemberIds?: string[];
} 