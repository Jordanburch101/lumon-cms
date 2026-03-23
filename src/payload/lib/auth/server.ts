import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink, twoFactor } from "better-auth/plugins";
import { payloadAdapter } from "./adapter";

export const auth = betterAuth({
  appName: "Lumon",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  basePath: "/api/auth",
  trustedOrigins: [process.env.NEXT_PUBLIC_SERVER_URL].filter(
    Boolean
  ) as string[],
  database: payloadAdapter,
  advanced: {
    database: {
      generateId: "serial",
    },
  },
  user: {
    modelName: "users",
    fields: {
      name: "name",
      email: "email",
      emailVerified: "email_verified",
      image: "image",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "guest",
        input: false,
      },
    },
  },
  session: {
    modelName: "ba-sessions",
    fields: {
      token: "token",
      userId: "user_id",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    cookieCache: {
      enabled: true,
      maxAge: 300,
    },
  },
  account: {
    modelName: "ba-accounts",
    fields: {
      accountId: "account_id",
      providerId: "provider_id",
      userId: "user_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      idToken: "id_token",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "ba-verifications",
    fields: {
      createdAt: "created_at",
      updatedAt: "updated_at",
      expiresAt: "expires_at",
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    twoFactor({
      issuer: "Lumon",
      schema: {
        twoFactor: {
          modelName: "ba-two-factors",
          fields: {
            backupCodes: "backup_codes",
            userId: "user_id",
          },
        },
      },
    }),
    magicLink({
      sendMagicLink: ({ email, url }) => {
        // TODO: Wire up Resend or similar
        console.log("Magic link for", email, ":", url);
      },
    }),
    nextCookies(),
  ],
});
