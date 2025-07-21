import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from '../../dto/login.dto';

export const LoginSwagger = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Login', description: 'Authenticate user and return JWT token.' }),
    ApiBody({ type: LoginDto, examples: {
      example: {
        summary: 'Login user',
        value: {
          email: 'user@example.com',
          password: 'Password@123'
        }
      }
    }}),
    ApiResponse({ status: 201, description: 'Login successful', schema: { example: {
      access_token: 'jwt.token.here',
      user: {
        id: 1,
        email: 'user@example.com',
        name: 'John Doe',
        role: 'USER',
        createdAt: '2024-07-18T12:00:00.000Z',
        updatedAt: '2024-07-18T12:00:00.000Z'
      }
    }}}),
    ApiResponse({ status: 401, description: 'Invalid credentials', schema: { example: { statusCode: 401, message: 'Invalid credentials', error: 'Unauthorized' }}}),
    ApiResponse({ status: 400, description: 'Validation error', schema: { example: { statusCode: 400, message: ['email must be an email', 'password should not be empty'], error: 'Bad Request' }}})
  );
}; 