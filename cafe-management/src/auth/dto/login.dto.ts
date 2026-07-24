import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+2519\d{8}$|^\+2517\d{8}$/, {
    message: 'Phone number must be in +251 format.',
  })
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'PIN must be exactly 6 digits.',
  })
  pin!: string;
}
