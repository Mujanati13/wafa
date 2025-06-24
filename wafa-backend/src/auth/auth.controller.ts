import { Body, Controller, Post, UsePipes,ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  
  
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  
  @Post('register')
 async registrer(@Body() body: RegisterDto) {
    // Logic for user registration
    return {
      status: 200,
      message: 'User registered successfully',
      data:await this.authService.register(body),
    }
  }
  @Post('login')
  async login(@Body() body: LoginDto) {
    return {
      status: 200,
      message: 'User logged in successfully',
      data: await this.authService.login(body),
    }
   }
}
