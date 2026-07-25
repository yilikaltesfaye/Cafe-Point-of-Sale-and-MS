import { IsEnum, IsString, IsDateString, MinLength } from 'class-validator';

import { BusinessRole, Gender } from 'generated/prisma/enums';

export class CreateEmployeeDto {
  /*
   * Employee login phone number.
   */
  @IsString()
  phoneNumber!: string;

  /*
   * Initial POS PIN.
   * Stored as a hash only.
   */
  @IsString()
  @MinLength(6)
  pin!: string;

  /*
   * Personal information.
   */
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

  /*
   * Business position.
   *
   * Example:
   * CASHIER
   * MANAGER
   * KITCHEN
   */
  @IsEnum(BusinessRole)
  role!: BusinessRole;
}
