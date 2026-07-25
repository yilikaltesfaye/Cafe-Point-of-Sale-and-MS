import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [PrismaModule, AuthModule, EmployeeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
