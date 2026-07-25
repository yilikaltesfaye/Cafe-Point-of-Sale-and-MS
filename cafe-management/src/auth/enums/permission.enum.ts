export enum Permission {
  //   Order permissions./
  CREATE_ORDER = 'CREATE_ORDER',
  VIEW_ORDERS = 'VIEW_ORDERS',
  CANCEL_ORDER = 'CANCEL_ORDER',

  //   Payment permissions.
  TAKE_PAYMENT = 'TAKE_PAYMENT',
  REFUND_PAYMENT = 'REFUND_PAYMENT',

  //   Inventory permissions.
  VIEW_INVENTORY = 'VIEW_INVENTORY',
  UPDATE_INVENTORY = 'UPDATE_INVENTORY',

  //   Employee management permissions.
  CREATE_EMPLOYEE = 'CREATE_EMPLOYEE',
  UPDATE_EMPLOYEE = 'UPDATE_EMPLOYEE',
  TERMINATE_EMPLOYEE = 'TERMINATE_EMPLOYEE',

  //   Reporting permissions.
  VIEW_REPORTS = 'VIEW_REPORTS',

  //   System permissions.
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
}
