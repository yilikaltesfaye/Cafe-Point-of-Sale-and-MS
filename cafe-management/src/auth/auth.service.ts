import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { EmploymentStatus, User } from 'generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import ms, { type StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async validateEmployee(phoneNumber: string, pin: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        phoneNumber,
      },
      include: {
        employee: true,
      },
    });
    if (!user || !user.employee) {
      throw new UnauthorizedException();
    }
    if (user.employee.employmentStatus !== EmploymentStatus.ACTIVE) {
      throw new UnauthorizedException();
    }
    const isValid = await argon2.verify(user.passwordHash!, pin);

    if (!isValid) {
      throw new UnauthorizedException();
    }

    return user;
  }
  async login(user: User) {
    const payload = {
      sub: user.id,
      isAdmin: user.isAdmin,
    };

    const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN as StringValue;
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN as StringValue;

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: refreshExpiresIn,
    });

    const refreshTokenHash = await argon2.hash(refreshToken);

    const expiresAt = new Date(Date.now() + ms(refreshExpiresIn));

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
