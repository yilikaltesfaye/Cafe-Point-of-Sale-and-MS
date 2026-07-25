import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

import { BusinessRole, Gender } from 'generated/prisma/enums';

export class CreateEmployeeDto {
  // Employee login phone number.
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+2519\d{8}$|^\+2517\d{8}$/, {
    message: 'Phone number must be in +251 format.',
  })
  phoneNumber!: string;

  // Initial POS PIN.
  // Stored as Argon2 hash.
  @IsString()
  @MinLength(6)
  pin!: string;

  // Employee personal information.
  @IsString()
  givenName!: string;

  @IsString()
  fatherName!: string;

  @IsString()
  grandFatherName!: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsEnum(Gender)
  gender!: Gender;

  // Employee business position.
  @IsEnum(BusinessRole)
  role!: BusinessRole;

  // Optional profile image.
  @IsOptional()
  @IsString()
  profilePicUrl?: string;
}
