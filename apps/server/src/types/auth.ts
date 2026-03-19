export type UserRole = "USER" | "ADMIN";

export type AuthContext = {
  userId: string;
  role: UserRole;
};

export type SessionRequestContext = {
  setSessionCookie: (token: string, expiresAt: Date) => void;
  clearSessionCookie: () => void;
};

export type GraphQLContext = {
  auth?: AuthContext;
  sessionToken?: string;
  requestContext?: SessionRequestContext;
};
