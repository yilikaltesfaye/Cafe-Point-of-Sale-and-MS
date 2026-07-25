import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from 'src/prisma/prisma.service';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

import { EmploymentStatus } from 'generated/prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      /*
       * Reads token from:
       *
       * Authorization: Bearer <access_token>
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      /*
       * Reject expired access tokens.
       */
      ignoreExpiration: false,

      /*
       * Secret used to verify access tokens.
       */
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  async validate(payload: JwtPayload) {
    /*
     * Load the user from database.
     *
     * The JWT only contains identifiers.
     * Permission data always comes from the database.
     */
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },

      include: {
        employee: true,
        customer: true,
      },
    });

    /*
     * JWT is valid but the account
     * no longer exists.
     */
    if (!user) {
      throw new UnauthorizedException('Invalid authentication.');
    }

    /*
     * Employees who are terminated
     * or on leave cannot access POS.
     */
    if (
      user.employee &&
      user.employee.employmentStatus !== EmploymentStatus.ACTIVE
    ) {
      throw new UnauthorizedException('Employee account is inactive.');
    }

    /*
     * Disabled customer accounts
     * cannot access customer features.
     */
    if (user.customer && !user.customer.isActive) {
      throw new UnauthorizedException('Customer account is inactive.');
    }

    /*
     * Returned object becomes:
     *
     * request.user
     *
     * Used by RolesGuard and controllers.
     */
    return user;
  }
}
