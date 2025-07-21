import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from '../repository/auth.repository';
import { LoggerService } from '../../logger/logger.service';

const LOGGER_CONTEXT = 'AuthService';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  private async checkIfUserExists(email: string): Promise<boolean> {
    this.logger.debug(`Checking if user exists: ${email}`, LOGGER_CONTEXT);
    const user = await this.authRepo.findByEmail(email);
    return Boolean(user);
  }

  async register(dto: RegisterDto): Promise<User> {
    try {
      this.logger.debug(`Attempting to register user: ${dto.email}`, LOGGER_CONTEXT);

      // Check for existing user to prevent duplicate registrations
      const exists = await this.checkIfUserExists(dto.email);
      if (exists) {
        this.logger.warn(`Register attempt failed — email already in use: ${dto.email}`, LOGGER_CONTEXT);
        throw new ConflictException('User with this email already exists');
      }

      // Use configured salt rounds for secure password hashing
      const saltRounds = Number(this.configService.get('PASSWORD_SALT_ROUNDS') ?? 10);
      const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

      // Persist the new user in the database
      const user = await this.authRepo.create({
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      });

      this.logger.log(`User successfully registered: ${user.email}`, LOGGER_CONTEXT);
      return user;
    } catch (error) {
      // Log and rethrow exceptions
      this.logger.error(`Registration failed for ${dto.email}: ${error.message}`, error.stack, LOGGER_CONTEXT);

      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: User }> {
    try {
      this.logger.debug(`Login attempt for user: ${loginDto.email}`, LOGGER_CONTEXT);

      // Retrieve user by email
      const user = await this.authRepo.findByEmail(loginDto.email);

      // Verify password
      const isPasswordValid = user && (await bcrypt.compare(loginDto.password, user.password));

      if (!isPasswordValid) {
        // Log unsuccessful login attempt
        this.logger.warn(`Login failed — invalid credentials: ${loginDto.email}`, LOGGER_CONTEXT);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT token with essential user payload
      const payload = { sub: user.id, email: user.email, role: user.role };
      const access_token = await this.jwtService.signAsync(payload);

      // Log successful login event
      this.logger.log(`User successfully logged in: ${user.email}`, LOGGER_CONTEXT);

      return { access_token, user };
    } catch (error) {
      // Log unexpected errors for further diagnosis
      this.logger.error(`Login failed for ${loginDto.email}: ${error.message}`, error.stack, LOGGER_CONTEXT);
      throw error;
    }
  }
}
