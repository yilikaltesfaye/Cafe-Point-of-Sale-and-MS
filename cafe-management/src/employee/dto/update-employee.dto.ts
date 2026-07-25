import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { BusinessRole, Gender } from 'generated/prisma/enums';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  givenName?: string;

  @IsOptional()
  @IsString()
  fatherName?: string;

  @IsOptional()
  @IsString()
  grandFatherName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  /*
   * Allows OWNER/MANAGER
   * to change employee position.
   */
  @IsOptional()
  @IsEnum(BusinessRole)
  role?: BusinessRole;

  @IsOptional()
  @IsString()
  profilePicUrl?: string;
}
