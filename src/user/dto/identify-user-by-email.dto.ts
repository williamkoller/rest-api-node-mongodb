import { IsEmail, IsNotEmpty } from 'class-validator';

export class IdentifyUserByEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
