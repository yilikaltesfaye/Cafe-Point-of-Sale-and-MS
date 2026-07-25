import { IsJWT } from 'class-validator';

// DTO used when requesting a new access token.
export class RefreshTokenDto {
  // Refresh token issued during login.
  @IsJWT()
  refreshToken!: string;
}
