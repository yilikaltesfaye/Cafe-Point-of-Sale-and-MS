import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { EmploymentStatus, User } from 'generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import ms, { type StringValue } from 'ms';
import { BusinessRole } from 'generated/prisma/client';
import { RegisterAdminDto } from './dto/register-admin.dto';
/* Used for verifying JWTs.*/
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async validateEmployee(phoneNumber: string, pin: string) {
    /*
     * Find employee account by phone number.
     */
    const user = await this.prisma.user.findUnique({
      where: {
        phoneNumber,
      },

      include: {
        employee: true,
      },
    });

    if (!user || !user.employee) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    /*
     * Only active employees can use POS.
     */
    if (user.employee.employmentStatus !== EmploymentStatus.ACTIVE) {
      throw new UnauthorizedException('Employee inactive.');
    }

    /*
     * Prevent login while PIN lock is active.
     */
    if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
      throw new UnauthorizedException('PIN temporarily locked.');
    }

    /*
     * Verify entered PIN against stored hash.
     */
    const isValid = await argon2.verify(user.pinHash!, pin);

    if (!isValid) {
      const maxAttempts = Number(process.env.PIN_MAX_ATTEMPTS ?? 5);

      const attempts = user.failedPinAttempts + 1;

      /*
       * Lock account after maximum failures.
       */
      if (attempts >= maxAttempts) {
        const lockMinutes = Number(process.env.PIN_LOCK_TIME_MINUTES ?? 15);

        await this.prisma.user.update({
          where: {
            id: user.id,
          },

          data: {
            failedPinAttempts: 0,

            pinLockedUntil: new Date(Date.now() + lockMinutes * 60 * 1000),
          },
        });
      } else {
        /*
         * Store failed attempt count.
         */
        await this.prisma.user.update({
          where: {
            id: user.id,
          },

          data: {
            failedPinAttempts: attempts,
          },
        });
      }

      throw new UnauthorizedException('Invalid PIN.');
    }

    /*
     * Reset security counters after successful login.
     */
    await this.prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        failedPinAttempts: 0,

        pinLockedUntil: null,

        lastLoginAt: new Date(),
      },
    });

    return user;
  }
  /*
   * Authenticates the user by creating a new login session
   * and issuing an access token and a refresh token.
   */
  async login(user: User) {
    /*
     * Token expiration values from the environment.
     */
    const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN as StringValue;
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN as StringValue;

    /*
     * Create the session first so its identifier
     * can be embedded inside both JWTs.
     *
     * The refresh token hash and expiration time
     * will be updated immediately after the tokens
     * are generated.
     */
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,

        /*
         * Temporary placeholder.
         * This will be replaced with the real Argon2 hash.
         */
        refreshTokenHash: '',

        /*
         * Temporary value.
         * Updated after the refresh token is created.
         */
        expiresAt: new Date(),
      },
    });

    /*
     * JWT payload shared by both access
     * and refresh tokens.
     */
    const payload: JwtPayload = {
      sub: user.id,

      /*
       * Identifies the login session.
       */
      sid: session.id,

      /*
       * System administrator permission.
       */
      isAdmin: user.isAdmin,
    };

    /*
     * Generate the short-lived access token.
     */
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessExpiresIn,
    });

    /*
     * Generate the long-lived refresh token.
     */
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: refreshExpiresIn,
    });

    /*
     * Never store the raw refresh token.
     */
    const refreshTokenHash = await argon2.hash(refreshToken);

    /*
     * Calculate when the refresh token expires.
     */
    const expiresAt = new Date(Date.now() + ms(refreshExpiresIn));

    /*
     * Replace the temporary session values
     * with the actual refresh token information.
     */
    await this.prisma.session.update({
      where: {
        id: session.id,
      },

      data: {
        refreshTokenHash,
        expiresAt,
      },
    });

    /*
     * Return both tokens to the client.
     */
    return {
      accessToken,
      refreshToken,
    };
  }
  /*
   * DEVELOPMENT ONLY.
   *
   * Creates the first administrator account.
   * This method will be removed once the system
   * has an initial OWNER.
   * Creates the first OWNER account.
   * This endpoint must be removed before production.
   */
  async bootstrapAdmin(dto: RegisterAdminDto) {
    /*
     * Prevent multiple bootstrap administrators.
     */
    const owner = await this.prisma.employee.findFirst({
      where: {
        role: BusinessRole.OWNER,
      },
    });

    if (owner) {
      throw new BadRequestException('Bootstrap administrator already exists.');
    }

    /*
     * Hash the employee PIN before storing it.
     */
    const pinHash = await argon2.hash(dto.pin);

    /*
     * Create the user and employee profile
     * in a single transaction.
     */
    const user = await this.prisma.user.create({
      data: {
        phoneNumber: dto.phoneNumber,

        pinHash,

        phoneVerified: true,

        isAdmin: true,

        employee: {
          create: {
            givenName: 'Nigussu',
            fatherName: 'Tesfaye',
            grandFatherName: 'Kebede',

            profilePicUrl: '',

            dateOfBirth: new Date('2002-08-06'),

            gender: 'MALE',

            role: BusinessRole.OWNER,
          },
        },
      },

      include: {
        employee: true,
      },
    });

    /*
     * Never return authentication hashes.
     */
    return {
      message: 'Bootstrap administrator created.',
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin,
        employee: user.employee,
      },
    };
  }

  /*
   * Validates the refresh token,
   * verifies the login session,
   * rotates the refresh token,
   * and issues a new token pair.
   */
  /*
   * Validates the refresh token,
   * verifies the login session,
   * and issues a new token pair.
   */
  async refresh(dto: RefreshTokenDto) {
    /*
     * Verify the JWT signature and expiration.
     * If verification fails, the request is rejected.
     */
    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      dto.refreshToken,
      {
        secret: process.env.JWT_REFRESH_SECRET!,
      },
    );

    /*
     * Continue using the verified payload.
     */
    /*
     * Load the login session referenced
     * by the JWT.
     */
    const session = await this.prisma.session.findUnique({
      where: {
        id: payload.sid,
      },

      include: {
        user: {
          include: {
            employee: true,
            customer: true,
          },
        },
      },
    });
    /*
     * Session no longer exists.
     */
    if (!session) {
      throw new UnauthorizedException('Invalid session.');
    }

    /*
     * Session has been revoked.
     */
    if (session.revokedAt) {
      throw new UnauthorizedException('Session has been revoked.');
    }

    /*
     * Refresh token lifetime has expired.
     */
    if (session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Session expired.');
    }
    /*
     * Compare the incoming refresh token
     * against the stored Argon2 hash.
     */
    const isValidRefreshToken = await argon2.verify(
      session.refreshTokenHash,
      dto.refreshToken,
    );

    if (!isValidRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }
    /*
     * Create a new payload using the existing session.
     *
     * The session ID remains the same because
     * this is the same login session being refreshed.
     */
    const newPayload: JwtPayload = {
      sub: session.user.id,

      /*
       * Keeps the token connected to
       * the database session.
       */
      sid: session.id,

      /*
       * Keeps current admin permission.
       */
      isAdmin: session.user.isAdmin,
    };

    /*
     * Generate a new access token.
     */
    const newAccessToken = await this.jwtService.signAsync(newPayload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as StringValue,
    });

    /*
     * Generate a new refresh token.
     */
    const newRefreshToken = await this.jwtService.signAsync(newPayload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as StringValue,
    });
    /*
     * Hash the new refresh token.
     *
     * The database never stores
     * the raw refresh token.
     */
    const newRefreshTokenHash = await argon2.hash(newRefreshToken);

    /*
     * Calculate the new refresh expiration date.
     */
    const newExpiresAt = new Date(
      Date.now() + ms(process.env.JWT_REFRESH_EXPIRES_IN as StringValue),
    );

    /*
     * Update the existing session.
     *
     * The old refresh token immediately becomes invalid.
     */
    await this.prisma.session.update({
      where: {
        id: session.id,
      },

      data: {
        refreshTokenHash: newRefreshTokenHash,

        expiresAt: newExpiresAt,
      },
    });
    /*
     * Client replaces the old tokens
     * with these new ones.
     */
    return {
      accessToken: newAccessToken,

      refreshToken: newRefreshToken,
    };
  }
  /*
   * Revokes a single session.
   *
   * The refresh token linked to this session
   * becomes unusable immediately.
   */
  async logout(dto: LogoutDto) {
    const session = await this.prisma.session.findUnique({
      where: {
        id: dto.sessionId,
      },
    });

    /*
     * Session does not exist.
     */
    if (!session) {
      throw new UnauthorizedException('Invalid session.');
    }

    /*
     * Mark the session as revoked.
     *
     * We do not delete it because:
     * - Audit history is important.
     * - Security events may need investigation.
     */
    await this.prisma.session.update({
      where: {
        id: dto.sessionId,
      },

      data: {
        revokedAt: new Date(),
      },
    });

    return {
      message: 'Session revoked successfully.',
    };
  }
  /*
   * Revokes every active session belonging
   * to a user.
   */
  async logoutAll(userId: string) {
    await this.prisma.session.updateMany({
      where: {
        userId,

        /*
         * Only update active sessions.
         */
        revokedAt: null,
      },

      data: {
        revokedAt: new Date(),
      },
    });

    return {
      message: 'All sessions revoked.',
    };
  }
  async createEmployee(dto: CreateEmployeeDto) {
    /*
     * Prevent duplicate phone accounts.
     */
    const existingUser = await this.prisma.user.findUnique({
      where: {
        phoneNumber: dto.phoneNumber,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Phone number already exists.');
    }

    /*
     * Hash PIN before storage.
     */
    const pinHash = await argon2.hash(dto.pin);

    /*
     * Create account and employee
     * profile together.
     */
    const user = await this.prisma.user.create({
      data: {
        phoneNumber: dto.phoneNumber,

        pinHash,

        employee: {
          create: {
            givenName: dto.givenName,

            fatherName: dto.fatherName,

            grandFatherName: dto.grandFatherName,

            profilePicUrl: '',

            dateOfBirth: new Date(dto.dateOfBirth),

            gender: dto.gender,

            role: dto.role,
          },
        },
      },

      include: {
        employee: true,
      },
    });

    /*
     * Do not return authentication hashes.
     */
    return {
      message: 'Employee created successfully.',

      employee: user.employee,
    };
  }
}
