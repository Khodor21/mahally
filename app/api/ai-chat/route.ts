import { NextRequest, NextResponse } from "next/server";
import { openai, buildSystemPrompt } from "@/lib/ai";
import { getCurrentStore } from "@/lib/store";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const store = await getCurrentStore();

    if (!store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Reset monthly limit if new month ───────────────────────────────
    const now = new Date();
    const currentMonth = now.getMonth();
    const lastReset = store.ai_last_reset_month
      ? new Date(store.ai_last_reset_month).getMonth()
      : null;

    if (lastReset !== currentMonth) {
      await supabaseAdmin
        .from("stores")
        .update({
          ai_messages_used: 0,
          ai_last_reset_month: now.toISOString(),
        })
        .eq("id", store.id);

      store.ai_messages_used = 0;
    }

    // ── Check credits ───────────────────────────────────────────────────
    if (store.ai_messages_used >= store.ai_messages_limit) {
      return NextResponse.json(
        { error: "AI limit reached. Upgrade your plan." },
        { status: 403 },
      );
    }

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // ── Get analytics (completed orders only) ──────────────────────────
    const firstDay = new Date();
    firstDay.setDate(1);

    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("total")
      .eq("store_id", store.id)
      .eq("status", "completed")
      .gte("created_at", firstDay.toISOString());

    const monthlyRevenue =
      orders?.reduce((sum, o) => sum + Number(o.total || 0), 0) ?? 0;

    const totalOrders = orders?.length ?? 0;

    // ── Build system prompt ────────────────────────────────────────────
    const system = buildSystemPrompt({
      storeName: store.store_name,
      storeType: store.store_type,
      monthlyRevenue,
      totalOrders,
    });

    // ── Call OpenAI ─────────────────────────────────────────────────────
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: message },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "Sorry, I couldn't generate a response.";

    // ── Update usage ────────────────────────────────────────────────────
    await supabaseAdmin
      .from("stores")
      .update({
        ai_messages_used: store.ai_messages_used + 1,
      })
      .eq("id", store.id);

    // ── Optional logging ───────────────────────────────────────────────
    await supabaseAdmin.from("ai_usage_logs").insert({
      store_id: store.id,
      prompt: message,
      response: reply,
    });

    return NextResponse.json({
      reply,
      usage: {
        used: store.ai_messages_used + 1,
        limit: store.ai_messages_limit,
      },
    });
  } catch (err: any) {
    console.error("AI Chat Error:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
