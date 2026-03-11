import { draftMode } from "next/headers";

export async function GET(request: Request) {
  const draft = await draftMode();
  draft.disable();

  const referer = request.headers.get("Referer");
  const redirectUrl = referer || "/";

  return Response.redirect(new URL(redirectUrl, request.url));
}
