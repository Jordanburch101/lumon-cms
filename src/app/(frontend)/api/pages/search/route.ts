import config from "@payload-config";
import { connection } from "next/server";
import { getPayload } from "payload";
import { linkableCollections } from "@/payload/fields/link/linkable-collections";

export async function GET(request: Request) {
  await connection();

  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";

    const allResults = await Promise.all(
      linkableCollections.map(async (slug) => {
        const { docs } = await payload.find({
          collection: slug,
          where: query ? { title: { contains: query } } : {},
          limit: 20,
          depth: 0,
          select: { title: true, slug: true },
        });
        return docs.map((doc) => ({
          id: doc.id as number,
          title:
            ((doc as Record<string, unknown>).title as string) ??
            `Untitled (${doc.id})`,
          slug: ((doc as Record<string, unknown>).slug as string) ?? "",
          collection: slug,
        }));
      })
    );

    const results = allResults.flat().slice(0, 20);

    return Response.json(results);
  } catch (err) {
    console.error("[pages/search] Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
