import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
    @IsString({ message: 'First name must be a string' })
    @MinLength(3, { message: 'First name must be at least 3 characters long' })
    @MaxLength(15, { message: 'First name must not exceed 15 characters' })
    firstName: string;

    @IsString({ message: 'Last name must be a string' })
    @MinLength(3, { message: 'Last name must be at least 3 characters long' })
    @MaxLength(15, { message: 'Last name must not exceed 15 characters' })
    lastName: string;

    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsString({ message: 'Password must be a string' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @MaxLength(20, { message: 'Password must not exceed 20 characters' })
    password: string;

}