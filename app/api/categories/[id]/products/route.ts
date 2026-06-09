import { supabaseAdmin } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const store = await getCurrentStore();
    if (!store) return NextResponse.json({ success: false }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(
        `
        id, title, logo_url,
        products(id, title, price, images, stock)
      `,
      )
      .eq("id", params.id)
      .eq("store_id", store.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        title: data.title,
        banner_url: data.logo_url,
        products: data.products || [],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
