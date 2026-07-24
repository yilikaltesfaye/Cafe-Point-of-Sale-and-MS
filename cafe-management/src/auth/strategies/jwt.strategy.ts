import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      include: {
        employee: true,
        customer: true,
      },
    });

    // The account no longer exists.
    if (!user) {
      throw new UnauthorizedException('Invalid authentication.');
    }

    // Employees whose employment has ended cannot access the POS.
    if (user.employee && user.employee.employmentStatus !== 'ACTIVE') {
      throw new UnauthorizedException('Employee account is inactive.');
    }

    // Disabled customer accounts cannot access customer features.
    if (user.customer && !user.customer.isActive) {
      throw new UnauthorizedException('Customer account is inactive.');
    }

    return user;
  }
}
