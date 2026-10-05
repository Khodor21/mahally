// app/api/delivery-rates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const LEBANON_GOVERNORATES = [
  "بيروت",
  "لبنان الشمالي",
  "جبل لبنان",
  "البقاع",
  "عكار",
  "بعلبك-الهرمل",
  "لبنان الجنوبي",
  "النبطية",
  "كسروان-جبيل",
];

export async function GET(req: NextRequest) {
  // const session = await getServerSession(authOptions);
  // if (!session?.user) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }s

  const storeId = req.nextUrl.searchParams.get("storeId");
  if (!storeId) {
    return NextResponse.json({ error: "storeId required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("delivery_city_rates")
    .select("governorate, delivery_cost")
    .eq("store_id", storeId)
    .order("governorate");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // لو ما في data، رجّع المحافظات بـ 0
  const rates =
    data && data.length > 0
      ? data
      : LEBANON_GOVERNORATES.map((g) => ({ governorate: g, delivery_cost: 0 }));

  return NextResponse.json({ rates });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { storeId, rates, oldGovernorate, newGovernorate } = await req.json();
  if (!storeId)
    return NextResponse.json({ error: "storeId required" }, { status: 400 });

  // لو في rename، احذف القديم أولاً
  if (oldGovernorate && newGovernorate && oldGovernorate !== newGovernorate) {
    await supabase
      .from("delivery_city_rates")
      .delete()
      .eq("store_id", storeId)
      .eq("governorate", oldGovernorate);
  }

  if (rates) {
    const { error } = await supabase.from("delivery_city_rates").upsert(
      rates.map((r: any) => ({
        store_id: storeId,
        governorate: r.governorate,
        delivery_cost: r.delivery_cost,
      })),
      { onConflict: "store_id,governorate" },
    );
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// أضف في نهاية route.ts
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeId = req.nextUrl.searchParams.get("storeId");
  const governorate = req.nextUrl.searchParams.get("governorate");
  if (!storeId || !governorate) {
    return NextResponse.json(
      { error: "storeId and governorate required" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("delivery_city_rates")
    .delete()
    .eq("store_id", storeId)
    .eq("governorate", governorate);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
