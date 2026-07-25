import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class EmployeeGuard implements CanActivate {
  // Allows access only to active employees.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    // User must have an employee profile.
    if (!user || !user.employee) {
      throw new ForbiddenException('Employee access required.');
    }

    // Employee must currently be active.
    if (user.employee.employmentStatus !== 'ACTIVE') {
      throw new ForbiddenException('Employee account inactive.');
    }

    return true;
  }
}
