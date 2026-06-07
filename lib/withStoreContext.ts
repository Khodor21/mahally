import { getStoreBySlug } from "./getStoreBySubdomain";

interface StoreRequest extends Request {
  store?: any;
}

export async function withStoreContext(
  req: any,
  handler: (req: any, store: any) => Promise<Response>,
) {
  // Extract slug from pathname like /store/storename/api/...
  const pathname = new URL(req.url).pathname;
  const pathSegments = pathname.split("/").filter(Boolean);

  // Expected format: /store/slug/api/...
  if (pathSegments[0] !== "store" || !pathSegments[1]) {
    return new Response(JSON.stringify({ error: "Invalid store request" }), {
      status: 400,
    });
  }

  const slug = pathSegments[1];
  const store = await getStoreBySlug(slug);

  if (!store) {
    return new Response(JSON.stringify({ error: "Store not found" }), {
      status: 404,
    });
  }

  return handler(req, store);
}
