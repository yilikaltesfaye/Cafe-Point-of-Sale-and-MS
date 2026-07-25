import { IsMobilePhone, IsString, Length } from 'class-validator';

/*
 * Temporary DTO used only for bootstrapping
 * the first administrator.
 *
 * This endpoint will be removed before production.
 */
export class RegisterAdminDto {
  /*
   * Ethiopian phone number.
   */
  @IsMobilePhone('am-AM')
  phoneNumber!: string;

  /*
   * Employee PIN.
   * Must contain exactly six digits.
   */
  @IsString()
  @Length(6, 6)
  pin!: string;
}
