import type { Access, FieldAccess } from "payload";

/**
 * Role-based access helpers.
 *
 * Payload's `req.user` includes the `role` field added to the Users collection.
 * These functions are used across collections to enforce permissions:
 *
 *   Admin  — full access to everything
 *   Editor — CRUD on content (Pages, Media), own profile only for Users
 *   Guest  — read-only, own profile only for Users
 */

export const isAdmin: Access = ({ req: { user } }) => user?.role === "admin";

export const isAdminOrEditor: Access = ({ req: { user } }) =>
  user?.role === "admin" || user?.role === "editor";

/** Admin can access all docs; others can only access their own. */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) {
    return false;
  }
  if (user.role === "admin") {
    return true;
  }
  return { id: { equals: user.id } };
};

export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user);

/** Field-level: only admins can edit this field. */
export const adminFieldOnly: FieldAccess = ({ req: { user } }) =>
  user?.role === "admin";
