import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'The title of the book',
    example: 'The Great Gatsby',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The total number of pages in the book',
    example: 180,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  numberOfPages: number;
}
