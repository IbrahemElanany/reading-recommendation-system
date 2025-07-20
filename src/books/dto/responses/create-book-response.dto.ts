import { ApiProperty } from '@nestjs/swagger';
import { BookTransformer } from '../../transformers/book.transformer';

export class CreateBookResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Book created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created book information',
    type: BookTransformer,
  })
  book: BookTransformer;
}
