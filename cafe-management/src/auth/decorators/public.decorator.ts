import { SetMetadata } from '@nestjs/common';

// Marks routes that do not require JWT authentication.
export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
