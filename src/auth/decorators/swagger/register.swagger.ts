import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegisterDto } from '../../dto/register.dto';

export const RegisterSwagger = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account.' }),
    ApiBody({ type: RegisterDto, examples: {
      example: {
        summary: 'Register user',
        value: {
          email: 'user@example.com',
          password: 'Password@123',
          name: 'John Doe'
        }
      }
    }}),
    ApiResponse({ status: 201, description: 'User registered successfully', schema: { example: {
      id: 1,
      email: 'user@example.com',
      name: 'John Doe',
      role: 'USER',
      createdAt: '2024-07-18T12:00:00.000Z',
      updatedAt: '2024-07-18T12:00:00.000Z'
    }}}),
    ApiResponse({ status: 409, description: 'User with this email already exists', schema: { example: { statusCode: 409, message: 'User with this email already exists', error: 'Conflict' }}}),
    ApiResponse({ status: 400, description: 'Validation error', schema: { example: { statusCode: 400, message: ['email must be an email', 'password must be at least 8 characters'], error: 'Bad Request' }}})
  );
}; 