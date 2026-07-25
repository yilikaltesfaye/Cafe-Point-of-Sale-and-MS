import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Gets authenticated user from request.user.
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
