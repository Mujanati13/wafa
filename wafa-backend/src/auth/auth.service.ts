import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schemas';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private  jwtService: JwtService
    ) { }

    async register(userData: RegisterDto) {
        try {
            const newUser = new this.userModel(userData);
        return newUser.save();
        } catch (error) {
         if(error.code === 11000) {
                throw new ConflictException('Email already exists');
            }
            throw new ConflictException('Registration failed');
        }
        
    }

    async login(userData: LoginDto) { 
        try {
            const user = await this.userModel.findOne({ email: userData.email });
            
            if (!user) {
                throw new NotFoundException('User not found');
            }
            const isPasswordValid = await bcrypt.compare(userData.password, user.password);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }

            //genertae jwt token
            const payload = { email: user.email, sub: user._id, role: user.role };
            const token = this.jwtService.sign(payload);
            return {
                access_token: token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                }
            };
        } catch (error) {
            
            throw new ConflictException('Login failed');
            
        }
    }  
}
