import { supabaseAdmin } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // 1. Await params if using Next.js 15 (safe for 14 too)
    const categoryId = params.id;

    // 2. Fetch from Supabase
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(
        `
        id, title, logo_url,
        products(id, title, price, images, stock)
      `,
      )
      .eq("id", categoryId)
      .single();

    // 3. IF SUPABASE FAILS, SEND THE EXACT ERROR TO THE BROWSER
    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: `Supabase Error: ${error.message}`,
          details: error.hint || error.details,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        title: data.title,
        banner_url: data.logo_url,
        products: data.products || [],
      },
    });
  } catch (error: any) {
    // IF THE SERVER CRASHES, SEND THE CRASH LOG TO THE BROWSER
    return NextResponse.json(
      { success: false, message: `Server Crash: ${error.message}` },
      { status: 500 },
    );
  }
}
