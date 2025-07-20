import { IsInt, IsNotEmpty, Min, Validate } from 'class-validator';
import { EndPageGreaterThanStartPageConstraint } from '../validators/end-page-greater-start-page.validator';
import { ApiProperty } from '@nestjs/swagger';

export class SingleIntervalDto {
  @ApiProperty({
    description: 'The starting page number of the reading interval',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  startPage: number;

  @ApiProperty({
    description: 'The ending page number of the reading interval',
    example: 50,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Validate(EndPageGreaterThanStartPageConstraint)
  endPage: number;

  @ApiProperty({
    description: 'The ID of the book this interval belongs to',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  bookId: number;
}
