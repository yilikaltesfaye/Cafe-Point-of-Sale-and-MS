import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { EmploymentStatus } from 'generated/prisma/enums';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      //  Reads token from: Authorization: Bearer <access_token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      //  Reject expired access tokens.
      ignoreExpiration: false,

      //  Secret used to verify access tokens.
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  async validate(payload: JwtPayload) {
    //  Verify that the JWT session still exists and is active.
    const session = await this.prisma.session.findUnique({
      where: {
        id: payload.sid,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found.');
    }

    //  Logout revokes sessions. Revoked sessions cannot use old access tokens.
    if (session.revokedAt) {
      throw new UnauthorizedException('Session revoked.');
    }

    // Session lifetime check.
    if (session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Session expired.');
    }

    // Load the user from database. JWT only contains identifiers. Permission data comes from database.
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },

      include: {
        employee: true,
        customer: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid authentication.');
    }

    //  Employees who are not active cannot access POS.
    if (
      user.employee &&
      user.employee.employmentStatus !== EmploymentStatus.ACTIVE
    ) {
      throw new UnauthorizedException('Employee account is inactive.');
    }

    //  Disabled customers cannot access customer features.
    if (user.customer && !user.customer.isActive) {
      throw new UnauthorizedException('Customer account is inactive.');
    }

    //  Returned object becomes: request.user
    /*
     * Attach session information
     * to every authenticated request.
     */
    return {
      ...user,
      sessionId: session.id,
    };
  }
}
