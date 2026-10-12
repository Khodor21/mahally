// app/api/partnerships/linked-stores/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const storeId = (session.user as any).id;

  const { data, error } = await supabaseAdmin
    .from("wholesale_retail_links")
    .select(
      `
      retail_store_id,
      stores!wholesale_retail_links_retail_store_id_fkey (
        id, store_name, slug
      )
    `,
    )
    .eq("wholesale_store_id", storeId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const stores = (data ?? []).map((row: any) => row.stores).filter(Boolean);

  return NextResponse.json({ stores });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const storeId = (session.user as any).id;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { retail_store_id } = body;

  if (!retail_store_id)
    return NextResponse.json(
      { error: "retail_store_id required" },
      { status: 400 },
    );

  // تأكد إن الـ retail store موجود
  const { data: retailStore } = await supabaseAdmin
    .from("stores")
    .select("id")
    .eq("id", retail_store_id)
    .maybeSingle();

  if (!retailStore)
    return NextResponse.json({ error: "Store not found" }, { status: 404 });

  // تأكد ما يضيف نفسه
  if (retail_store_id === storeId)
    return NextResponse.json(
      { error: "Cannot link to yourself" },
      { status: 400 },
    );

  const { error } = await supabaseAdmin.from("wholesale_retail_links").insert({
    wholesale_store_id: storeId,
    retail_store_id,
  });

  if (error?.code === "23505")
    return NextResponse.json({ error: "Already linked" }, { status: 409 });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const storeId = (session.user as any).id;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { retail_store_id } = body;

  if (!retail_store_id)
    return NextResponse.json(
      { error: "retail_store_id required" },
      { status: 400 },
    );

  const { error } = await supabaseAdmin
    .from("wholesale_retail_links")
    .delete()
    .eq("wholesale_store_id", storeId)
    .eq("retail_store_id", retail_store_id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
