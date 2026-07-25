import { IsString, Length, Matches } from 'class-validator';

// Temporary DTO used only for bootstrapping the first administrator.
// This endpoint will be removed before production.

export class RegisterAdminDto {
  // Ethiopian phone number.
  @Matches(/^\+2519\d{8}$|^\+2517\d{8}$/, {
    message: 'Phone number must be in +251 format.',
  })
  phoneNumber!: string;

  // Employee PIN. Must contain exactly six digits.
  @IsString()
  @Length(6, 6)
  pin!: string;
}
