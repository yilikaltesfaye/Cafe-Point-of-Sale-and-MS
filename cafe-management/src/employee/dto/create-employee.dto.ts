import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { BusinessRole, Gender } from 'generated/prisma/enums';

export class CreateEmployeeDto {
  // Employee login phone number.

  @IsString()
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
