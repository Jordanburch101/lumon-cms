import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";

const INTERNAL_SLUGS = new Set([
  "payload-jobs",
  "payload-migrations",
  "payload-preferences",
  "payload-locked-documents",
  "payload-mcp-api-keys",
  "payload-kv",
]);

export async function GET() {
  const payload = await getPayload({ config });
  const headersList = await getHeaders();

  // Auth check — parse user from payload-token cookie
  const user = await payload
    .auth({ headers: headersList })
    .then((result) => result.user)
    .catch(() => null);

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
          typeof col.labels?.plural === "string" ? col.labels.plural : col.slug,
        slug: col.slug,
        titleField,
      };
    });

  return Response.json(collections);
}
