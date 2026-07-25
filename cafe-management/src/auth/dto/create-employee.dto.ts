import {
  IsEnum,
  IsString,
  IsDateString,
  MinLength,
  Matches,
  IsNotEmpty,
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

  // Initial POS PIN. Stored as a hash only.

  @IsString()
  @MinLength(6)
  pin!: string;

  // Personal information.
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

  // Business position.
  // Example: CASHIER MANAGER KITCHEN
  @IsEnum(BusinessRole)
  role!: BusinessRole;
}
