import { 
  Body, 
  Controller, 
  Post,
  SetMetadata
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SetMetadata('rate_limit', { limit: 20, duration: 30 }) // 20 requests per 30s
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @SetMetadata('rate_limit', { limit: 20, duration: 30 }) // 20 requests per 30s
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}