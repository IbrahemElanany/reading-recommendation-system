import { ApiProperty } from '@nestjs/swagger';

// ============================================================================
// COMMON SWAGGER PATTERNS
// ============================================================================

export const SWAGGER_CONSTANTS = {
  // Common response patterns
  responses: {
    success: {
      description: 'Request completed successfully',
    },
    badRequest: {
      description: 'Validation error - Invalid input data',
    },
    unauthorized: {
      description: 'Authentication required - Invalid or missing credentials',
    },
    forbidden: {
      description: 'Access denied - Insufficient permissions',
    },
    notFound: {
      description: 'Resource not found',
    },
    conflict: {
      description: 'Resource conflict - Duplicate or conflicting data',
    },
    tooManyRequests: {
      description: 'Rate limit exceeded - Too many requests',
    },
    internalServerError: {
      description: 'Internal server error',
    },
  },

  // Common HTTP status codes
  statusCodes: {
    ok: 200,
    created: 201,
    noContent: 204,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    conflict: 409,
    tooManyRequests: 429,
    internalServerError: 500,
  },

  // Common field patterns
  fields: {
    id: {
      description: 'Unique identifier',
      example: 1,
      type: Number,
    },
    email: {
      description: 'Email address',
      example: 'user@example.com',
      type: String,
    },
    password: {
      description: 'Password (min 8 characters)',
      example: 'SecurePassword123!',
      type: String,
      minLength: 8,
    },
    name: {
      description: 'Full name',
      example: 'John Doe',
      type: String,
    },
    createdAt: {
      description: 'Creation timestamp',
      example: '2024-01-15T10:30:00.000Z',
      type: String,
    },
    updatedAt: {
      description: 'Last update timestamp',
      example: '2024-01-15T10:30:00.000Z',
      type: String,
    },
  },

  // Common examples
  examples: {
    pagination: {
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10,
    },
    paginationResponse: {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10,
      },
    },
  },

  // Common tags
  tags: {
    auth: {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    users: {
      name: 'Users',
      description: 'User management endpoints',
    },
    books: {
      name: 'Books',
      description: 'Book management and recommendation endpoints',
    },
    health: {
      name: 'Health',
      description: 'System health and status endpoints',
    },
  },
};

// ============================================================================
// COMMON RESPONSE DTOs
// ============================================================================

export class PaginationDto {
  @ApiProperty(SWAGGER_CONSTANTS.fields.id)
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    type: Number,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
    type: Number,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
    type: Number,
  })
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items',
    type: 'array',
    items: { type: 'object' },
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}

// ============================================================================
// COMMON ERROR RESPONSE DTOs
// ============================================================================

export class ValidationErrorDto {
  @ApiProperty({
    description: 'Field name that failed validation',
    example: 'email',
    type: String,
  })
  field: string;

  @ApiProperty({
    description: 'Validation error message',
    example: 'email must be an email',
    type: String,
  })
  message: string;

  @ApiProperty({
    description: 'Validation constraint that failed',
    example: 'isEmail',
    type: String,
    required: false,
  })
  constraint?: string;
}

export class BaseErrorResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false,
    type: Boolean,
  })
  success: boolean;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'An error occurred',
    type: String,
  })
  message: string;

  @ApiProperty({
    description: 'Error type/category',
    example: 'Bad Request',
    type: String,
  })
  error: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
    type: Number,
  })
  statusCode: number;

  @ApiProperty({
    description: 'ISO timestamp of the error',
    example: '2024-01-15T10:30:00.000Z',
    type: String,
  })
  timestamp: string;

  @ApiProperty({
    description: 'API endpoint path',
    example: '/api/v1/auth/register',
    type: String,
  })
  path: string;

  @ApiProperty({
    description: 'HTTP method used',
    example: 'POST',
    type: String,
  })
  method: string;
}

export class ValidationErrorResponseDto extends BaseErrorResponseDto {
  @ApiProperty({
    description: 'Validation error details',
    type: 'array',
    items: { type: 'object' },
  })
  details: ValidationErrorDto[];
}

// ============================================================================
// COMMON SUCCESS RESPONSE DTOs
// ============================================================================

export class BaseSuccessResponseDto<T> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
    type: Boolean,
  })
  success: boolean;

  @ApiProperty({
    description: 'Human-readable success message',
    example: 'Operation completed successfully',
    type: String,
  })
  message: string;

  @ApiProperty({
    description: 'Response data payload',
    type: 'object',
    additionalProperties: true,
  })
  data: T;

  @ApiProperty({
    description: 'ISO timestamp of the response',
    example: '2024-01-15T10:30:00.000Z',
    type: String,
  })
  timestamp: string;

  @ApiProperty({
    description: 'API endpoint path',
    example: '/api/v1/auth/register',
    type: String,
  })
  path: string;

  @ApiProperty({
    description: 'HTTP method used',
    example: 'POST',
    type: String,
  })
  method: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 201,
    type: Number,
  })
  statusCode: number;
} 