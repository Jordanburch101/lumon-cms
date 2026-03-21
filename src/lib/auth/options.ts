import { nextCookies } from "better-auth/next-js";
import { magicLink, twoFactor } from "better-auth/plugins";
import type { PayloadAuthOptions } from "payload-auth/better-auth";

const betterAuthPlugins = [
  twoFactor({
    issuer: "Lumon",
  }),
  magicLink({
    sendMagicLink: ({
      email,
      url,
    }: {
      email: string;
      token: string;
      url: string;
    }) => {
      // TODO: Wire up real email sending (Resend, etc.)
      console.log("Magic link for", email, ":", url);
    },
  }),
  nextCookies(),
];

const betterAuthOptions = {
  appName: "Lumon",
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  trustedOrigins: ([process.env.NEXT_PUBLIC_SERVER_URL] as string[]).filter(
    Boolean
  ),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: betterAuthPlugins,
};

export const payloadAuthOptions = {
  disableDefaultPayloadAuth: true,
  hidePluginCollections: true,
  users: {
    slug: "users",
    adminRoles: ["admin"],
    defaultRole: "guest",
    defaultAdminRole: "admin",
    roles: ["guest", "editor", "admin"],
    allowedFields: ["name"],
  },
  accounts: { slug: "accounts" },
  sessions: { slug: "sessions" },
  verifications: { slug: "verifications" },
  betterAuthOptions,
} satisfies PayloadAuthOptions;
