import { BusinessRole } from 'generated/prisma/client';

import { Permission } from '../enums/permission.enum';

/*
 * Defines what each business role
 * can do inside the system.
 */
export const ROLE_PERMISSIONS = {
  [BusinessRole.OWNER]: [
    Permission.CREATE_ORDER,
    Permission.VIEW_ORDERS,
    Permission.CANCEL_ORDER,
    Permission.TAKE_PAYMENT,
    Permission.REFUND_PAYMENT,
    Permission.VIEW_INVENTORY,
    Permission.UPDATE_INVENTORY,
    Permission.CREATE_EMPLOYEE,
    Permission.UPDATE_EMPLOYEE,
    Permission.TERMINATE_EMPLOYEE,
    Permission.VIEW_REPORTS,
    Permission.MANAGE_SETTINGS,
  ],

  [BusinessRole.MANAGER]: [
    Permission.CREATE_ORDER,
    Permission.VIEW_ORDERS,
    Permission.CANCEL_ORDER,
    Permission.TAKE_PAYMENT,
    Permission.VIEW_INVENTORY,
    Permission.UPDATE_INVENTORY,
    Permission.CREATE_EMPLOYEE,
    Permission.UPDATE_EMPLOYEE,
    Permission.VIEW_REPORTS,
  ],

  [BusinessRole.CASHIER]: [
    Permission.CREATE_ORDER,
    Permission.VIEW_ORDERS,
    Permission.TAKE_PAYMENT,
  ],

  [BusinessRole.WAITER]: [Permission.CREATE_ORDER, Permission.VIEW_ORDERS],

  [BusinessRole.KITCHEN]: [Permission.VIEW_ORDERS],

  [BusinessRole.DELIVERY]: [Permission.VIEW_ORDERS],
} as const;
