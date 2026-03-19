import { GraphQLNonNull, GraphQLString } from "graphql";
import { Account } from "../../accounts/AccountModel";
import { createUserSession } from "../../sessions/sessionService";
import { AuthPayloadType } from "../AuthPayloadType";
import { User } from "../UserModel";
import { verifyPassword } from "../password";
import type { GraphQLContext } from "../../../types/auth";

export const LoginMutation = {
  type: new GraphQLNonNull(AuthPayloadType),
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _source: unknown,
    { email, password }: { email: string; password: string },
    context: GraphQLContext,
  ) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new Error("Credenciais invalidas");
    }

    if (!user.active) {
      throw new Error("Usuario inativo");
    }

    const account = await Account.findOne({ userId: user.id });

    if (!account) {
      throw new Error("Conta do usuario nao encontrada");
    }

    const session = await createUserSession({
      userId: user.id,
      role: user.role,
    });

    context.requestContext?.setSessionCookie(session.token, session.expiresAt);

    return { user, account };
  },
};
