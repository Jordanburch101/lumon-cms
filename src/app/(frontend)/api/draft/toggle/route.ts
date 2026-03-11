import config from "@payload-config";
import { draftMode } from "next/headers";
import { getPayload } from "payload";

async function authenticate(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  return user;
}

export async function GET(request: Request) {
  const user = await authenticate(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const draft = await draftMode();
  return Response.json({ enabled: draft.isEnabled });
}

export async function POST(request: Request) {
  const user = await authenticate(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const draft = await draftMode();
  const wasEnabled = draft.isEnabled;

  if (wasEnabled) {
    draft.disable();
  } else {
    draft.enable();
  }

  return Response.json({ enabled: !wasEnabled });
}
