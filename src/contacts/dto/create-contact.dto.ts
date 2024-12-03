import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsPhoneNumber()
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  notes: string;
}
