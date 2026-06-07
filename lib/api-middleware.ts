// import { NextRequest } from "next/server";
// import {
//   getStoreBySubdomain,
//   getSubdomainFromRequest,
// } from "./getStoreBySubdomain";

// export async function withStoreContext(handler: Function) {
//   return async (request: NextRequest) => {
//     const subdomain = getSubdomainFromRequest(request.headers);

//     if (!subdomain) {
//       return new Response(JSON.stringify({ error: "Invalid request" }), {
//         status: 400,
//       });
//     }

//     const store = await getStoreBySubdomain(subdomain);

//     if (!store) {
//       return new Response(JSON.stringify({ error: "Store not found" }), {
//         status: 404,
//       });
//     }

//     // Call the handler with store context
//     return handler(request, store);
//   };
// }
