import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { verifyStoreAccess } from "@/lib/auth";
import { z } from "zod";

const CategorySchema = z.object({
  title: z.string().min(1),
  logo_url: z.string().url().optional().or(z.literal("")),
  store_id: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, logo_url, store_id } = CategorySchema.parse(body);

    if (!(await verifyStoreAccess(store_id)))
      return new NextResponse("Forbidden", { status: 403 });

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({ title, logo_url, store_id })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Creation failed" }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const store_id = searchParams.get("store_id");
  if (!store_id || !(await verifyStoreAccess(store_id)))
    return new NextResponse("Forbidden", { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("store_id", store_id);
  return NextResponse.json(data || []);
}
