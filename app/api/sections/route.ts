import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { verifyStoreAccess } from "@/lib/auth";
import { z } from "zod";

const SectionSchema = z.object({
  title: z.string().min(1),
  banner_url: z.string().url().optional().or(z.literal("")),
  category_id: z.string().uuid(),
  status: z.enum(["active", "draft"]),
  store_id: z.string().uuid(),
  section_order: z.number().default(0),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, banner_url, category_id, status, store_id, section_order } =
      SectionSchema.parse(body);

    if (!(await verifyStoreAccess(store_id)))
      return new NextResponse("Forbidden", { status: 403 });

    const { data, error } = await supabaseAdmin
      .from("storefront_sections")
      .insert({
        title,
        banner_url,
        category_id,
        status,
        store_id,
        section_order,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "Section creation failed" },
      { status: 400 },
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const store_id = searchParams.get("store_id");
  if (!store_id || !(await verifyStoreAccess(store_id)))
    return new NextResponse("Forbidden", { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("storefront_sections")
    .select("*, categories(title)") // Join to get category name
    .eq("store_id", store_id)
    .order("section_order", { ascending: true });

  return NextResponse.json(data || []);
}
