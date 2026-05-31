// app/api/test-auth/route.ts
import { requireStoreSession } from "@/lib/store";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireStoreSession();
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 401 },
    );
  }
}
