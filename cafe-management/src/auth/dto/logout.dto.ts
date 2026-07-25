import { IsUUID } from 'class-validator';

// Identifies the session that should be revoked.
export class LogoutDto {
  // Session ID created during login.
  @IsUUID()
  sessionId!: string;
}
