import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateModuleDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    academicYear: string;

    @IsNotEmpty()
    @IsString()
    specialization: string;
}
