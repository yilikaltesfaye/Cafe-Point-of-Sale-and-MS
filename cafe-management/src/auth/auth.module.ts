import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from 'src/prisma/prisma.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AdminGuard } from './guards/admin.guard';
import { EmployeeGuard } from './guards/employee.guard';
import { CustomerGuard } from './guards/customer.guard';

import { type StringValue } from 'ms';
import { APP_GUARD } from '@nestjs/core';
import { PermissionGuard } from './guards/permission.guard';

@Module({
  imports: [
    /* Makes PrismaService available inside * AuthService, JwtStrategy, and Guards.*/
    PrismaModule,

    /* Registers Passport. * JWT is the default authentication strategy. * Sessions are handled manually using Prisma Session. */
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),

    /* Provides JWT signing and verification. */
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET!,
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as StringValue,
      },
    }),
  ],

  controllers: [AuthController],

  providers: [
    /* Business authentication logic. */
    AuthService,

    /* Passport strategies. */
    LocalStrategy,
    JwtStrategy,

    /* Authentication guards. */
    LocalAuthGuard,
    JwtAuthGuard,

    /* Authorization guard. * Checks @Roles() metadata * after authentication succeeds. */
    RolesGuard,

    /*
     * Protects every route by default.
     * Routes marked with @Public() bypass JWT.
     */
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AdminGuard,
    EmployeeGuard,
    CustomerGuard,
    PermissionGuard,
  ],

  exports: [
    /* Allows other modules to use Passport. */
    PassportModule,

    /* Allows other modules to create * and verify JWT tokens. */
    JwtModule,

    /* Allows controllers in other modules * to protect routes. */
    JwtAuthGuard,

    /* * Allows other modules to use * role-based authorization. */
    RolesGuard,
    AdminGuard,
    EmployeeGuard,
    CustomerGuard,
    PermissionGuard,
  ],
})
export class AuthModule {}
