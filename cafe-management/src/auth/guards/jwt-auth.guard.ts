import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/*
 * Uses the JwtStrategy.
 * Every protected route will pass through this guard.
 * If the access token is valid, Passport attaches the user to req.user.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
