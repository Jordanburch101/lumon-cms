import type { Access, FieldAccess } from "payload";

/**
 * Role-based access helpers.
 *
 * Payload's `req.user` includes the `role` field added to the Users collection.
 * The MCP plugin adds a `PayloadMcpApiKey` type to the user union that lacks
 * `role`, so we use a safe accessor to handle both.
 *
 *   Admin  — full access to everything
 *   Editor — CRUD on content (Pages, Media), own profile only for Users
 *   Guest  — read-only, own profile only for Users
 */

export function getRole(user: unknown): string | undefined {
  if (user && typeof user === "object" && "role" in user) {
    return (user as { role: string }).role;
  }
  return undefined;
}

export const isAdmin: Access = ({ req: { user } }) => getRole(user) === "admin";

export const isAdminOrEditor: Access = ({ req: { user } }) => {
  const role = getRole(user);
  return role === "admin" || role === "editor";
};

/** Admin can access all docs; others can only access their own. */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) {
    return false;
  }
  if (getRole(user) === "admin") {
    return true;
  }
  return { id: { equals: user.id } };
};

export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user);

/** Field-level: only admins can edit this field. */
export const adminFieldOnly: FieldAccess = ({ req: { user } }) =>
  getRole(user) === "admin";
