import type { CollectionConfig } from "payload";
import { betterAuthStrategy } from "@/payload/lib/auth/strategy";
import {
  adminFieldOnly,
  getRole,
  isAdmin,
  isAdminOrSelf,
  isLoggedIn,
} from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: {
    strategies: [betterAuthStrategy],
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // Sync password changes to Better Auth's credential store.
        // Payload is the source of truth — when a password is set here,
        // update the BA account so /login works with the same password.
        if (!data?.password) {
          return data;
        }
        if (operation !== "update") {
          return data;
        }

        const userId = originalDoc?.id;
        if (!userId) {
          return data;
        }

        try {
          const { hashPassword } = await import("better-auth/crypto");
          const baHash = await hashPassword(data.password);

          // Update the BA credential account's password hash
          const existing = await req.payload.find({
            collection: "ba-accounts",
            where: {
              userId: { equals: Number(userId) },
              providerId: { equals: "credential" },
            },
            limit: 1,
            overrideAccess: true,
            req,
          });

          if (existing.docs.length > 0) {
            await req.payload.update({
              collection: "ba-accounts",
              id: existing.docs[0].id,
              data: { password: baHash },
              overrideAccess: true,
              req,
            });
          }
        } catch {
          // Best-effort — don't block the Payload save
          req.payload.logger.warn(
            "Failed to sync password to Better Auth credential store"
          );
        }

        return data;
      },
    ],
    afterLogout: [
      async ({ req }) => {
        // Clear Better Auth session cookie on Payload logout.
        // Without this, the BA strategy re-authenticates after the JWT is cleared.
        const cookieHeader = req.headers.get("cookie") || "";
        if (cookieHeader.includes("better-auth.session_token")) {
          // Call BA's sign-out to destroy the session server-side
          try {
            const { auth } = await import("@/payload/lib/auth/server");
            await auth.api.signOut({ headers: req.headers });
          } catch {
            // Best-effort — session will expire naturally
          }

          // Also clear the cookies via response headers
          if (req.responseHeaders) {
            const secure =
              process.env.NODE_ENV === "production" ? "; Secure" : "";
            req.responseHeaders.append(
              "Set-Cookie",
              `better-auth.session_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`
            );
            req.responseHeaders.append(
              "Set-Cookie",
              `better-auth.session_data=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`
            );
          }
        }
      },
    ],
  },
  access: {
    read: isLoggedIn,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  endpoints: [
    {
      method: "post",
      path: "/:id/2fa/enable",
      handler: async (req) => {
        if (getRole(req.user) !== "admin") {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const id = req.routeParams?.id as string | undefined;
        if (!id) {
          return Response.json({ error: "Missing user ID" }, { status: 400 });
        }

        const secret = process.env.BETTER_AUTH_SECRET;
        if (!secret) {
          return Response.json(
            { error: "Server misconfigured: missing BETTER_AUTH_SECRET" },
            { status: 500 }
          );
        }

        const { symmetricEncrypt, generateRandomString } = await import(
          "better-auth/crypto"
        );
        const { createOTP } = await import("@better-auth/utils/otp");

        // Delete any existing 2FA record for this user
        const existing = await req.payload.find({
          collection: "ba-two-factors",
          where: { userId: { equals: Number(id) } },
          limit: 1,
        });
        for (const doc of existing.docs) {
          await req.payload.delete({
            collection: "ba-two-factors",
            id: doc.id,
          });
        }

        // Generate TOTP secret
        const rawSecret: string = generateRandomString(32, "a-z", "A-Z", "0-9");
        const encryptedSecret: string = await symmetricEncrypt({
          data: rawSecret,
          key: secret,
        });

        // Create the 2FA record (but do NOT enable yet — user must verify first)
        await req.payload.create({
          collection: "ba-two-factors",
          data: {
            secret: encryptedSecret,
            userId: Number(id),
          },
        });

        // Generate TOTP URI for QR code
        const user = await req.payload.findByID({
          collection: "users",
          id,
        });
        const otp = createOTP(rawSecret, { digits: 6, period: 30 });
        const totpURI: string = otp.url(
          "Lumon",
          (user.email as string) ?? "user"
        );

        return Response.json({ enabled: true, totpURI });
      },
    },
    {
      method: "post",
      path: "/:id/2fa/verify",
      handler: async (req) => {
        if (getRole(req.user) !== "admin") {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const id = req.routeParams?.id as string | undefined;
        if (!id) {
          return Response.json({ error: "Missing user ID" }, { status: 400 });
        }

        const body = (await req.json?.().catch(() => null)) as {
          code?: string;
        } | null;
        const code = body?.code;
        if (!code || code.length !== 6) {
          return Response.json(
            { error: "A 6-digit code is required" },
            { status: 400 }
          );
        }

        const secret = process.env.BETTER_AUTH_SECRET;
        if (!secret) {
          return Response.json(
            { error: "Server misconfigured: missing BETTER_AUTH_SECRET" },
            { status: 500 }
          );
        }

        // Find the 2FA record
        const existing = await req.payload.find({
          collection: "ba-two-factors",
          where: { userId: { equals: Number(id) } },
          limit: 1,
        });

        if (existing.docs.length === 0) {
          return Response.json(
            { error: "2FA setup not started. Enable 2FA first." },
            { status: 400 }
          );
        }

        const { symmetricDecrypt } = await import("better-auth/crypto");
        const { createOTP } = await import("@better-auth/utils/otp");

        // Decrypt the stored secret and verify the code
        const encryptedSecret = existing.docs[0].secret as string;
        const rawSecret: string = await symmetricDecrypt({
          data: encryptedSecret,
          key: secret,
        });

        const otp = createOTP(rawSecret, { digits: 6, period: 30 });
        const isValid = await otp.verify(code);

        if (!isValid) {
          return Response.json(
            { error: "Invalid code. Please try again." },
            { status: 400 }
          );
        }

        // Code is valid — now enable 2FA on the user
        await req.payload.update({
          collection: "users",
          id,
          data: { twoFactorEnabled: true },
        });

        return Response.json({ verified: true, enabled: true });
      },
    },
    {
      method: "post",
      path: "/:id/2fa/disable",
      handler: async (req) => {
        if (getRole(req.user) !== "admin") {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const id = req.routeParams?.id as string | undefined;
        if (!id) {
          return Response.json({ error: "Missing user ID" }, { status: 400 });
        }

        // Delete existing 2FA records for this user
        const existing = await req.payload.find({
          collection: "ba-two-factors",
          where: { userId: { equals: Number(id) } },
          limit: 1,
        });
        for (const doc of existing.docs) {
          await req.payload.delete({
            collection: "ba-two-factors",
            id: doc.id,
          });
        }

        // Disable 2FA on the user
        await req.payload.update({
          collection: "users",
          id,
          data: { twoFactorEnabled: false },
        });

        return Response.json({ enabled: false });
      },
    },
    {
      method: "post",
      path: "/:id/2fa/backup-codes",
      handler: async (req) => {
        if (getRole(req.user) !== "admin") {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const id = req.routeParams?.id as string | undefined;
        if (!id) {
          return Response.json({ error: "Missing user ID" }, { status: 400 });
        }

        const secret = process.env.BETTER_AUTH_SECRET;
        if (!secret) {
          return Response.json(
            { error: "Server misconfigured: missing BETTER_AUTH_SECRET" },
            { status: 500 }
          );
        }

        const { symmetricEncrypt, generateRandomString } = await import(
          "better-auth/crypto"
        );

        // Generate 10 backup codes in XXXXX-XXXXX format
        const codes: string[] = Array.from({ length: 10 }, () => {
          const raw: string = generateRandomString(10, "a-z", "A-Z", "0-9");
          return `${raw.slice(0, 5)}-${raw.slice(5)}`;
        });

        const encryptedCodes: string = await symmetricEncrypt({
          data: JSON.stringify(codes),
          key: secret,
        });

        // Update the existing 2FA record
        const existing = await req.payload.find({
          collection: "ba-two-factors",
          where: { userId: { equals: Number(id) } },
          limit: 1,
        });

        if (existing.docs.length === 0) {
          return Response.json(
            { error: "2FA is not enabled for this user" },
            { status: 400 }
          );
        }

        await req.payload.update({
          collection: "ba-two-factors",
          id: existing.docs[0].id,
          data: { backupCodes: encryptedCodes },
        });

        return Response.json({ codes });
      },
    },
  ],
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Profile photo displayed on blog articles",
      },
    },
    {
      name: "bio",
      type: "textarea",
      admin: {
        description: "Short author bio for blog articles",
      },
    },
    {
      name: "jobTitle",
      type: "text",
      admin: {
        description: "Job title or role displayed on blog articles",
      },
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "guest",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Guest", value: "guest" },
      ],
      access: {
        update: adminFieldOnly,
      },
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "emailVerified",
      type: "checkbox",
      defaultValue: false,
      admin: { hidden: true },
    },
    {
      name: "image",
      type: "text",
      admin: { hidden: true },
    },
    {
      name: "twoFactorEnabled",
      type: "checkbox",
      defaultValue: false,
      admin: { hidden: true },
    },
    {
      name: "twoFactorManagement",
      type: "ui",
      admin: {
        position: "sidebar",
        components: {
          Field: "@/components/features/auth/two-factor-admin#TwoFactorAdmin",
        },
      },
    },
  ],
};
