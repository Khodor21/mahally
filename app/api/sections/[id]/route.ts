import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { verifyStoreAccess } from "@/lib/auth";
import { z } from "zod";

const SectionUpdateSchema = z.object({
  title: z.string().min(1),
  banner_url: z.string().url().optional().or(z.literal("")),
  category_id: z.string().uuid(),
  status: z.enum(["active", "draft"]),
  store_id: z.string().uuid(),
  section_order: z.number().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { title, banner_url, category_id, status, store_id, section_order } =
      SectionUpdateSchema.parse(body);

    if (!(await verifyStoreAccess(store_id)))
      return new NextResponse("Forbidden", { status: 403 });

    const updatePayload: Record<string, unknown> = {
      title,
      banner_url,
      category_id,
      status,
    };
    if (section_order !== undefined)
      updatePayload.section_order = section_order;

    const { data, error } = await supabaseAdmin
      .from("storefront_sections")
      .update(updatePayload)
      .eq("id", params.id)
      .eq("store_id", store_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "Section update failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { searchParams } = new URL(req.url);
  const store_id = searchParams.get("store_id");

  if (!store_id || !(await verifyStoreAccess(store_id)))
    return new NextResponse("Forbidden", { status: 403 });

  const { error } = await supabaseAdmin
    .from("storefront_sections")
    .delete()
    .eq("id", params.id)
    .eq("store_id", store_id);

  if (error)
    return NextResponse.json(
      { error: "Section deletion failed" },
      { status: 400 },
    );

  return NextResponse.json({ success: true });
}
