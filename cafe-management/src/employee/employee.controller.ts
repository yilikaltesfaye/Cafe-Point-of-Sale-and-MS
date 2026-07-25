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

import { BusinessRole } from 'generated/prisma/enums';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // Only OWNER and MANAGER can create employees.
  @Post()
  @Auth(BusinessRole.OWNER, BusinessRole.MANAGER)
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(dto);
  }

  @Patch(':id')
  @Auth(BusinessRole.OWNER, BusinessRole.MANAGER)
  updateEmployee(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeeService.updateEmployee(id, dto);
  }

  @Patch(':id/terminate')
  @Auth(BusinessRole.OWNER)
  terminateEmployee(@Param('id') id: string) {
    return this.employeeService.terminateEmployee(id);
  }
}
