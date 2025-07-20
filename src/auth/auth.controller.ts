import { 
  Body, 
  Controller, 
  Post,
  SetMetadata,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { 
  AUTH_SWAGGER,
  RegisterRequestDto,
  LoginRequestDto,
  UserResponseDto,
  LoginResponseDto
} from './swagger/auth.swagger';
import { BaseSuccessResponseDto, BaseErrorResponseDto } from '../common/swagger/swagger.constants';

@ApiTags(AUTH_SWAGGER.tags.name)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @SetMetadata('rate_limit', { limit: 20, duration: 30 }) // 20 requests per 30s
  @ApiOperation(AUTH_SWAGGER.register)
  @ApiBody({
    type: RegisterRequestDto,
    description: 'User registration data',
    examples: AUTH_SWAGGER.examples.register,
  })
  @ApiResponse(AUTH_SWAGGER.responses.registerSuccess)
  @ApiBadRequestResponse({
    description: AUTH_SWAGGER.responses.badRequest.description,
    type: BaseErrorResponseDto,
  })
  @ApiConflictResponse({
    description: AUTH_SWAGGER.responses.conflict.description,
    type: BaseErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: AUTH_SWAGGER.responses.internalServerError.description,
    type: BaseErrorResponseDto,
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('rate_limit', { limit: 20, duration: 30 }) // 20 requests per 30s
  @ApiOperation(AUTH_SWAGGER.login)
  @ApiBody({
    type: LoginRequestDto,
    description: 'User login credentials',
    examples: AUTH_SWAGGER.examples.login,
  })
  @ApiResponse(AUTH_SWAGGER.responses.loginSuccess)
  @ApiBadRequestResponse({
    description: AUTH_SWAGGER.responses.badRequest.description,
    type: BaseErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: AUTH_SWAGGER.responses.unauthorized.description,
    type: BaseErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: AUTH_SWAGGER.responses.internalServerError.description,
    type: BaseErrorResponseDto,
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}