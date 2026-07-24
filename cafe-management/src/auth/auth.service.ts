import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { EmploymentStatus, User } from 'generated/prisma/client';
import { JwtService } from '@nestjs/jwt';

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

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
    };
  }
}
