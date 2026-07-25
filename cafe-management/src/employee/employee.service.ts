import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import * as argon2 from 'argon2';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmploymentStatus } from 'generated/prisma/enums';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  //    * Creates an employee account.
  async createEmployee(dto: CreateEmployeeDto) {
    //  * Prevent duplicate accounts.

    const existingUser = await this.prisma.user.findUnique({
      where: {
        phoneNumber: dto.phoneNumber,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Phone number already exists.');
    }

    //  * Hash PIN before storing.

    const pinHash = await argon2.hash(dto.pin);

    //  * Create User and Employee
    //  * in one transaction.

    const user = await this.prisma.user.create({
      data: {
        phoneNumber: dto.phoneNumber,

        pinHash,

        employee: {
          create: {
            givenName: dto.givenName,

            fatherName: dto.fatherName,

            grandFatherName: dto.grandFatherName,

            dateOfBirth: new Date(dto.dateOfBirth),

            gender: dto.gender,

            role: dto.role,

            profilePicUrl: dto.profilePicUrl ?? '',
          },
        },
      },

      include: {
        employee: true,
      },
    });

    //  * Return only employee data.

    return {
      message: 'Employee created successfully.',

      employee: user.employee,
    };
  }
  /*
   * Updates employee information.
   */
  async updateEmployee(id: string, dto: UpdateEmployeeDto) {
    return this.prisma.employee.update({
      where: {
        id,
      },

      data: {
        ...dto,

        /*
         * Convert date string
         * before saving.
         */
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });
  }

  /*
   * Terminates employee without deleting history.
   */
  async terminateEmployee(id: string) {
    return this.prisma.employee.update({
      where: {
        id,
      },

      data: {
        /*
         * Employee records stay
         * for transaction history.
         */
        employmentStatus: EmploymentStatus.TERMINATED,
      },
    });
  }
}
