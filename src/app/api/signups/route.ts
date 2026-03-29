import { NextRequest, NextResponse } from "next/server";
import { signupSchema } from "@/lib/validators/signup";
import type { Signup } from "@/types/signup";

// In-memory store until Supabase is connected
const signups: Signup[] = [];

export async function GET() {
  return NextResponse.json(signups);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const signup: Signup = {
      id: crypto.randomUUID(),
      discordUsername: parsed.data.discordUsername,
      opggLink: parsed.data.opggLink,
      primaryRole: parsed.data.primaryRole,
      secondaryRole: parsed.data.secondaryRole || undefined,
      currentRank: parsed.data.currentRank,
      peakRank: parsed.data.peakRank,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    signups.push(signup);

    return NextResponse.json(signup, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
