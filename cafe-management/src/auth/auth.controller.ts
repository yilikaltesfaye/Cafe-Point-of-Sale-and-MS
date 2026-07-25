import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { User } from 'generated/prisma/client';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // Authenticates the employee using the LocalStrategy. If successful, req.user is populated before this method executes.
  // Login does not require an existing token.
  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(req.user! as User);
  }

  @Get('me')
  @Auth()
  me(@CurrentUser() user: any) {
    // JwtStrategy attaches the authenticated user here.
    return user;
  }

  // DEVELOPMENT ONLY. Creates the first OWNER account. Remove this endpoint before deploying. Bootstrap admin is temporary and public. Remove after creating the first OWNER.
  @Public()
  @Post('bootstrap-admin')
  bootstrapAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.bootstrapAdmin(dto);
  }

  // Issues a new access token and rotates the refresh token. Refresh uses the refresh token instead of the expired access token.
  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }
  // Revokes the current login session. The access token can still exist until expiration, but refresh will fail because the session is revoked.
  /*
   * Logs out the current session.
   */
  @Post('logout')
  @Auth()
  logout(@CurrentUser() user: any) {
    return this.authService.logout(user.sessionId, user.id);
  }

  // Revokes every active session for the authenticated user.
  @Post('logout-all')
  @Auth()
  logoutAll(@CurrentUser() user: any) {
    return this.authService.logoutAll(user.id);
  }
}
