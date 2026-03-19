import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLString,
} from "graphql";
import { AccountType } from "../modules/accounts/AccountType";
import { Account } from "../modules/accounts/AccountModel";
import { TransactionType } from "../modules/transactions/TransactionType";
import { Transaction } from "../modules/transactions/TransactionModel";
import { User } from "../modules/users/UserModel";
import type { GraphQLContext } from "../types/auth";

const UserRoleType = new GraphQLEnumType({
  name: "QueryUserRole",
  values: {
    USER: { value: "USER" },
    ADMIN: { value: "ADMIN" },
  },
});

const MeType = new GraphQLObjectType({
  name: "Me",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: new GraphQLNonNull(UserRoleType) },
    active: { type: new GraphQLNonNull(GraphQLBoolean) },
    accountId: {
      type: GraphQLID,
      resolve: async (user) => {
        const account = await Account.findOne({ userId: user.id });
        return account?.id ?? null;
      },
    },
  },
});

export const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    me: {
      type: MeType,
      resolve: async (
        _source: unknown,
        _args: unknown,
        context: GraphQLContext,
      ) => {
        if (!context.auth?.userId) {
          return null;
        }

        return await User.findById(context.auth.userId);
      },
    },

    account: {
      type: AccountType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { id }: { id: string }) => {
        return await Account.findById(id);
      },
    },

    accounts: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(AccountType)),
      ),
      resolve: async () => {
        return await Account.find();
      },
    },

    transaction: {
      type: TransactionType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { id }: { id: string }) => {
        return await Transaction.findById(id);
      },
    },

    transactions: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(TransactionType)),
      ),
      resolve: async () => {
        return await Transaction.find();
      },
    },
  },
});
