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
import { type StringValue } from 'ms';

@Module({
  imports: [
    // Makes PrismaService available inside AuthService and JwtStrategy.
    PrismaModule,

    // Registers Passport.
    // JWT becomes the default authentication strategy.
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),

    // Registers the JWT service used for signing and verifying tokens.
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET!,
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as StringValue,
      },
    }),
  ],

  controllers: [AuthController],

  providers: [
    // Authentication service.
    AuthService,

    // Passport strategies.
    LocalStrategy,
    JwtStrategy,

    // Guards.
    LocalAuthGuard,
    JwtAuthGuard,
  ],

  exports: [
    // Allows other modules to use JWT authentication.
    PassportModule,
    JwtModule,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
