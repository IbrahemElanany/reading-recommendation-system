import { ApiProperty } from '@nestjs/swagger';

export class ReadingIntervalResponseDto {
  @ApiProperty({
    description: 'Status of the operation',
    example: 'success',
    enum: ['success', 'error'],
  })
  status: string;
}

export class ReadingIntervalErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Invalid page numbers provided',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;
}
