import { ApiProperty } from '@nestjs/swagger';
import { SWAGGER_CONSTANTS, BaseSuccessResponseDto, BaseErrorResponseDto } from '../../common/swagger/swagger.constants';

// ============================================================================
// REQUEST DTOs with Swagger Decorators
// ============================================================================

export class RegisterRequestDto {
  @ApiProperty(SWAGGER_CONSTANTS.fields.email)
  email: string;

  @ApiProperty(SWAGGER_CONSTANTS.fields.password)
  password: string;

  @ApiProperty({
    ...SWAGGER_CONSTANTS.fields.name,
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'User role',
    example: 'USER',
    enum: ['USER', 'ADMIN'],
    default: 'USER',
    required: false,
  })
  role?: string;
}

export class LoginRequestDto {
  @ApiProperty(SWAGGER_CONSTANTS.fields.email)
  email: string;

  @ApiProperty(SWAGGER_CONSTANTS.fields.password)
  password: string;
}

// ============================================================================
// RESPONSE DTOs with Swagger Decorators
// ============================================================================

export class UserResponseDto {
  @ApiProperty(SWAGGER_CONSTANTS.fields.id)
  id: number;

  @ApiProperty(SWAGGER_CONSTANTS.fields.email)
  email: string;

  @ApiProperty(SWAGGER_CONSTANTS.fields.name)
  name: string;

  @ApiProperty({
    description: 'User role',
    example: 'USER',
    enum: ['USER', 'ADMIN'],
    type: String,
  })
  role: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    type: String,
  })
  access_token: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}

// Use common response DTOs from swagger.constants.ts
export { BaseSuccessResponseDto as ApiResponseDto, BaseErrorResponseDto as ErrorResponseDto };

// ============================================================================
// SWAGGER CONSTANTS
// ============================================================================

export const AUTH_SWAGGER = {
  tags: {
    name: 'Authentication',
    description: 'User authentication and authorization endpoints',
  },
  register: {
    summary: 'Register a new user',
    description: 'Create a new user account with email, password, and optional name. Duplicate emails are not allowed.',
    operationId: 'registerUser',
  },
  login: {
    summary: 'Login user',
    description: 'Authenticate user with email and password. Returns JWT token for subsequent API calls.',
    operationId: 'loginUser',
  },
  responses: {
    registerSuccess: {
      status: 201,
      description: 'User registered successfully',
      type: BaseSuccessResponseDto<UserResponseDto>,
    },
    loginSuccess: {
      status: 200,
      description: 'User logged in successfully',
      type: BaseSuccessResponseDto<LoginResponseDto>,
    },
    badRequest: {
      status: 400,
      description: 'Validation error - Invalid input data',
      type: BaseErrorResponseDto,
    },
    unauthorized: {
      status: 401,
      description: 'Invalid credentials - Wrong email or password',
      type: BaseErrorResponseDto,
    },
    conflict: {
      status: 409,
      description: 'User already exists - Email already registered',
      type: BaseErrorResponseDto,
    },
    internalServerError: {
      status: 500,
      description: 'Internal server error',
      type: BaseErrorResponseDto,
    },
  },
  examples: {
    register: {
      basic: {
        summary: 'Basic Registration',
        value: {
          email: 'user@example.com',
          password: 'SecurePassword123!',
          name: 'John Doe'
        }
      },
      withRole: {
        summary: 'Registration with Role',
        value: {
          email: 'admin@example.com',
          password: 'AdminPassword123!',
          name: 'Admin User',
          role: 'ADMIN'
        }
      }
    },
    login: {
      basic: {
        summary: 'Basic Login',
        value: {
          email: 'user@example.com',
          password: 'SecurePassword123!'
        }
      }
    }
  }
}; 