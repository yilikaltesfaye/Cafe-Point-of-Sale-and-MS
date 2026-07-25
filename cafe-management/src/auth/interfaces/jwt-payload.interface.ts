// Information stored inside every JWT. Keep the payload small.Additional user information is always loadedfrom the database.
export interface JwtPayload {
  // User identifier.
  sub: string;

  // Login session identifier. Used to verify that the session still exists and has not been revoked.
  sid: string;

  // Indicates whether the account has system administrator privileges.
  isAdmin: boolean;
}
