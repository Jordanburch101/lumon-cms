import type { AuthStrategy } from "payload";

export const betterAuthStrategy: AuthStrategy = {
  name: "better-auth",
  authenticate: async ({ payload, headers }) => {
    const cookieHeader = headers.get("cookie") || "";

    // Skip if no BA cookie present
    if (!cookieHeader.includes("better-auth.session_token")) {
      return { user: null };
    }

    // If a payload-token JWT exists, let Payload's built-in JWT strategy handle it.
    // This ensures admin panel operations (save, logout) work correctly —
    // without this, the BA strategy re-authenticates after JWT changes.
    if (cookieHeader.includes("payload-token")) {
      return { user: null };
    }

    try {
      // Lazy import to avoid circular dependency
      const { auth } = await import("./server");

      const session = await auth.api.getSession({ headers });
      if (!session?.user?.id) {
        return { user: null };
      }

      // Look up the Payload user by ID (BA shares the users table)
      const user = await payload.findByID({
        collection: "users",
        id: Number(session.user.id),
        depth: 0,
      });

      if (!user) {
        return { user: null };
      }

      return {
        user: {
          ...user,
          collection: "users",
        },
      };
    } catch {
      // Graceful fallthrough to JWT strategy on any failure
      return { user: null };
    }
  },
};
