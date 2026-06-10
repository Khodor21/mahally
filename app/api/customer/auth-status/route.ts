// app/api/customer/auth-status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireCustomerSession } from "@/lib/customer-auth";

export async function GET(req: NextRequest) {
  try {
    const customer = await requireCustomerSession();

    return NextResponse.json({
      authenticated: true,
      customerId: customer.id,
      storeId: customer.store_id,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
