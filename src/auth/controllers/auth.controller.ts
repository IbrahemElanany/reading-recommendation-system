import { 
  Body, 
  Controller, 
  Post,
  SetMetadata
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { RegisterSwagger } from '../decorators/swagger/register.swagger';
import { LoginSwagger } from '../decorators/swagger/login.swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Register a new user
   * @param dto RegisterDto
   * @returns The created user (without password)
   */
  @SetMetadata('rate_limit', { limit: 20, duration: 30 }) // 20 requests per 30s
  @Post('register')
  @RegisterSwagger()
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Login and get JWT token
   * @param dto LoginDto
   * @returns JWT access token and user info
   */
  @SetMetadata('rate_limit', { limit: 20, duration: 30 }) // 20 requests per 30s
  @Post('login')
  @LoginSwagger()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}