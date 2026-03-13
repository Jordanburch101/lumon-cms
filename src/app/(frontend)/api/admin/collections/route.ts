import config from "@payload-config";
import { connection } from "next/server";
import { getPayload } from "payload";

const INTERNAL_SLUGS = new Set([
  "payload-jobs",
  "payload-migrations",
  "payload-preferences",
  "payload-locked-documents",
  "payload-mcp-api-keys",
  "payload-kv",
]);

export async function GET(request: Request) {
  await connection();
  try {
    const payload = await getPayload({ config });

    // Auth check — parse user from payload-token cookie
    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const collections = payload.config.collections
      .filter((col) => !INTERNAL_SLUGS.has(col.slug))
      .map((col) => {
        const isUpload = Boolean(col.upload);
        const useAsTitle =
          typeof col.admin?.useAsTitle === "string"
            ? col.admin.useAsTitle
            : undefined;

        let titleField: string;
        if (useAsTitle) {
          titleField = useAsTitle;
        } else if (isUpload) {
          titleField = "filename";
        } else {
          titleField = "id";
        }

        return {
          hasVersions: Boolean(col.versions),
          isUpload,
          label:
            typeof col.labels?.plural === "string"
              ? col.labels.plural
              : col.slug,
          slug: col.slug,
          titleField,
        };
      });

    return Response.json(collections);
  } catch (err) {
    console.error("[admin/collections] Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
