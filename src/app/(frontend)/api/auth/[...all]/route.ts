import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/payload/lib/auth/server";

export const { GET, POST } = toNextJsHandler(auth);
