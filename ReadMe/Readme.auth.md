# Authentication and Authorization System Documentation

## Cafe Point of Sale and Management System Backend

---

# 1. Overview

The authentication and authorization system is responsible for:

- Identifying users.
- Protecting API routes.
- Managing login sessions.
- Controlling access to system features.
- Protecting employee POS access.
- Separating system administration from business roles.
- Enforcing permissions across the backend.

The system is divided into two parts:

## Authentication

Authentication answers:

> "Who is this user?"

Examples:

- Employee logging in with phone number and PIN.
- Validating JWT access tokens.
- Refreshing expired access tokens.
- Checking active sessions.

---

## Authorization

Authorization answers:

> "What is this user allowed to do?"

Examples:

- Only managers can manage employees.
- Only owners can view financial reports.
- Cashiers can create sales but cannot modify salaries.

---

# 2. Technology Stack Used

The authentication system uses:

| Technology            | Usage                                        |
| --------------------- | -------------------------------------------- |
| NestJS                | Backend framework                            |
| Passport.js           | Authentication framework                     |
| passport-local        | Employee PIN login strategy                  |
| passport-jwt          | JWT authentication strategy                  |
| JWT                   | Access and refresh tokens                    |
| Prisma ORM            | Database communication                       |
| PostgreSQL            | Data storage                                 |
| Argon2                | Hashing PINs and refresh tokens              |
| class-validator       | DTO validation                               |
| TypeScript Decorators | Custom authentication decorators             |
| NestJS Guards         | Authentication and authorization enforcement |

---

# 3. Database Authentication Models

## User Model

Every account starts from the `User` table.

Purpose:

- Store authentication identity.
- Store security information.
- Connect employees and customers.

Important fields:

```prisma
id
phoneNumber
email
passwordHash
pinHash
failedPinAttempts
pinLockedUntil
lastLoginAt
isAdmin
```

---

## Employee Model

Employees extend users.

Example:

```
User
 |
 Employee
```

Contains:

- Name information.
- Gender.
- Date of birth.
- Business role.
- Employment status.

Example:

```prisma
BusinessRole

OWNER
MANAGER
CASHIER
WAITER
KITCHEN
DELIVERY
```

---

## Customer Model

Customers can optionally have user accounts.

Example:

```
User
 |
 Customer
```

Used for:

- Customer applications.
- Future customer login.
- Customer-specific features.

---

# 4. Authentication Flow

Complete login flow:

```
Client
 |
 | phone + PIN
 |
AuthController
 |
LocalAuthGuard
 |
LocalStrategy
 |
AuthService.validateEmployee()
 |
Database Verification
 |
JWT Generation
 |
Session Creation
 |
Return Tokens
```

---

# 5. Local Authentication

## LocalAuthGuard

File:

```
guards/local-auth.guard.ts
```

Purpose:

Protects login endpoints.

Example:

```ts
@UseGuards(LocalAuthGuard)
@Post('login')
login()
```

It executes:

```
LocalStrategy
```

before entering the controller.

---

# LocalStrategy

Purpose:

Receives:

```
phoneNumber
PIN
```

Then calls:

```
AuthService.validateEmployee()
```

If successful:

```
request.user = authenticated user
```

---

# 6. Employee PIN Security

Employee authentication uses PIN instead of passwords.

PINs are never stored directly.

Stored:

```
Argon2 Hash
```

Example:

```
1234

becomes

$argon2id$v=19...
```

---

# Failed PIN Attempts

Database:

```prisma
failedPinAttempts
```

Every failed attempt:

```
failedPinAttempts + 1
```

---

# PIN Lockout

Configuration:

```
PIN_MAX_ATTEMPTS
PIN_LOCK_TIME_MINUTES
```

Example:

```
5 failed attempts
        |
        v
15 minute lock
```

Stored:

```prisma
pinLockedUntil
```

---

# Successful Login Reset

After successful login:

```ts
failedPinAttempts = 0;

pinLockedUntil = null;

lastLoginAt = now;
```

---

# 7. JWT Authentication

The system uses two JWT tokens.

---

# Access Token

Purpose:

Used for API authentication.

Example:

```
Authorization: Bearer access_token
```

Short lifetime.

Contains:

```ts
{
 sub: userId,
 sid: sessionId,
 isAdmin: boolean
}
```

---

# Refresh Token

Purpose:

Generate new access tokens.

Long lifetime.

The raw refresh token is never stored.

Only:

```
Argon2 hash
```

is stored.

---

# 8. Session Management

Database:

```
Session
```

Purpose:

Track active logins.

Stores:

```prisma
id

userId

refreshTokenHash

deviceInfo

ipAddress

expiresAt

revokedAt
```

---

Example:

```
User

 |
 + Session Laptop

 |
 + Session Phone

 |
 + Session Tablet
```

---

# 9. Refresh Token Rotation

Process:

```
Refresh Request

      |
      v

Verify JWT

      |
      v

Find Session

      |
      v

Check Revoked Status

      |
      v

Check Expiration

      |
      v

Verify Hash

      |
      v

Generate New Tokens

      |
      v

Replace Refresh Hash
```

Old refresh tokens become invalid immediately.

---

# 10. Logout

Logout does not delete sessions.

Instead:

```prisma
revokedAt
```

is updated.

Example:

Before:

```
Session
active
```

After:

```
Session
revokedAt = date
```

---

# Logout All

Purpose:

Invalidate every active session.

Used for:

- Security incidents.
- Account recovery.
- Password changes.

---

# 11. JWT Strategy

File:

```
strategies/jwt.strategy.ts
```

Runs on every protected request.

Flow:

```
Request

 |
Bearer Token

 |
JwtAuthGuard

 |
JwtStrategy

 |
Database Validation

 |
request.user
```

Checks:

- JWT signature.
- Token expiration.
- Session status.
- User existence.
- Employee status.
- Customer status.

---

# 12. Authentication Decorators

## @Public()

Purpose:

Skip authentication.

Used for:

```ts
@Post('login')
@Public()
```

Examples:

- Login.
- Refresh token.
- Temporary bootstrap setup.

---

# @Auth()

Main authentication decorator.

Instead of:

```ts
@UseGuards(JwtAuthGuard)
```

Use:

```ts
@Auth()
```

Example:

```ts
@Get('me')
@Auth()
me()
```

Meaning:

> User must be authenticated.

---

# @Auth() With Roles

The system supports:

```ts
@Auth(
 BusinessRole.OWNER,
 BusinessRole.MANAGER
)
```

Meaning:

```
Authenticate user

AND

User role must be OWNER or MANAGER
```

Example:

```ts
@Post('employees')
@Auth(
 BusinessRole.OWNER,
 BusinessRole.MANAGER
)
createEmployee()
```

---

# 13. Current User Decorator

File:

```
decorators/current-user.decorator.ts
```

Purpose:

Access:

```
request.user
```

Example:

```ts
@Get('me')
@Auth()
me(
 @CurrentUser() user
)
{
 return user;
}
```

---

# 14. Authorization System

Authorization has two layers:

```
Authentication

        |

Authorization

        |

Role Check

        |

Permission Check
```

---

# 15. Role Based Authorization

## BusinessRole

Roles represent employee positions.

Example:

```
OWNER

MANAGER

CASHIER

WAITER

KITCHEN

DELIVERY
```

---

# RolesGuard

File:

```
guards/roles.guard.ts
```

Purpose:

Checks:

```
Does user have required role?
```

Example:

```ts
@Roles(
 BusinessRole.MANAGER
)
```

---

Example:

```ts
@Get('salary')
@Auth(
 BusinessRole.OWNER,
 BusinessRole.MANAGER
)
getSalary()
```

Allowed:

```
OWNER
MANAGER
```

Denied:

```
CASHIER
WAITER
```

---

# 16. Permission Based Authorization

Roles are broad.

Permissions are specific.

Example:

Role:

```
MANAGER
```

Permissions:

```
CREATE_EMPLOYEE

DELETE_EMPLOYEE

VIEW_SALARY

APPROVE_DISCOUNT
```

---

# PermissionGuard

File:

```
guards/permission.guard.ts
```

Purpose:

Checks exact capabilities.

Example:

```ts
@Permissions(
 Permission.CREATE_EMPLOYEE
)
```

---

Example:

```ts
@Post()
@Auth()
@Permissions(
 Permission.CREATE_EMPLOYEE
)
createEmployee()
```

---

# 17. Roles vs Permissions

## Roles

Use when access is based on job position.

Example:

```
Only managers can access employee management.
```

Use:

```ts
@Auth(
 BusinessRole.MANAGER
)
```

---

## Permissions

Use when access is based on action.

Example:

```
Can this person create employees?
```

Use:

```ts
@Permissions(
 Permission.CREATE_EMPLOYEE
)
```

---

# 18. Guards Available

## JwtAuthGuard

Authentication guard.

Checks:

```
Is user logged in?
```

---

## LocalAuthGuard

Login guard.

Checks:

```
Are credentials valid?
```

---

## AdminGuard

Checks:

```ts
user.isAdmin === true;
```

Used for:

- System administrators.
- Owner management actions.

---

## EmployeeGuard

Checks:

```
Is this an employee account?
```

---

## CustomerGuard

Checks:

```
Is this a customer account?
```

---

## RolesGuard

Checks:

```
Business role access
```

---

## PermissionGuard

Checks:

```
Specific action permissions
```

---

# 19. Example Controller Authorization

## Public Endpoint

```ts
@Public()
@Post('login')
login()
```

Anyone can access.

---

## Logged In User

```ts
@Auth()
@Get('profile')
profile()
```

Requires authentication.

---

## Manager Only

```ts
@Auth(
 BusinessRole.MANAGER
)
@Get('employees')
employees()
```

Requires:

```
Valid JWT

+

MANAGER role
```

---

## Permission Protected

```ts
@Auth()
@Permissions(
 Permission.VIEW_SALARY
)
@Get('salary')
salary()
```

Requires:

```
Valid JWT

+

VIEW_SALARY permission
```

---

# 20. Security Rules

The system follows:

- Never store raw PINs.
- Never store raw refresh tokens.
- Never trust JWT permission data.
- Always load permissions from database.
- Do not delete employee records.
- Revoke sessions instead of deleting.
- Separate business roles from system permissions.

---

# 21. Current Completion Status

Authentication:

✅ Employee login
✅ PIN verification
✅ PIN hashing
✅ PIN lockout
✅ JWT access tokens
✅ Refresh tokens
✅ Token rotation
✅ Session tracking
✅ Logout
✅ Logout all
✅ JWT validation

Authorization:

✅ JWT Guard
✅ Public routes
✅ Auth decorator
✅ Current user decorator
✅ Admin guard
✅ Employee guard
✅ Customer guard
✅ Role guard
✅ Permission guard
✅ Role decorator
✅ Permission decorator
✅ Combined `@Auth(Role...)` authorization

---

# Authentication and Authorization Foundation Status

**Completed.**

The backend now has the security foundation required for:

- POS operations
- Employee management
- Customer systems
- Business modules
- Financial modules
- Future mobile/web applications

Future backend modules should use this system instead of creating separate authentication logic.
