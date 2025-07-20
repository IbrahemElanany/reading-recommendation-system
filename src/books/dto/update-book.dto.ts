import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating a book. All fields are optional to allow partial updates.
 */
export class UpdateBookDto {
  @ApiPropertyOptional({ description: 'The title of the book', example: 'The Great Gatsby' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'The total number of pages in the book', example: 180, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  numberOfPages?: number;
} 