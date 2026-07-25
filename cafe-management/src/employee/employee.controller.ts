import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  Patch,
} from '@nestjs/common';

import { EmployeeService } from './employee.service';

import { CreateEmployeeDto } from './dto/create-employee.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { RolesGuard } from 'src/auth/guards/roles.guard';

import { Roles } from 'src/auth/decorators/roles.decorator';

import { BusinessRole } from 'generated/prisma/enums';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // Only OWNER and MANAGER can create employees.
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(BusinessRole.OWNER, BusinessRole.MANAGER)
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(BusinessRole.OWNER, BusinessRole.MANAGER)
  updateEmployee(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeeService.updateEmployee(id, dto);
  }

  @Patch(':id/terminate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(BusinessRole.OWNER)
  terminateEmployee(@Param('id') id: string) {
    return this.employeeService.terminateEmployee(id);
  }
}
