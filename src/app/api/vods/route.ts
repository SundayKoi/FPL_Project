import { NextRequest, NextResponse } from "next/server";
import { vodSchema } from "@/lib/validators/vod";
import type { Vod } from "@/types/vod";

// In-memory store until Supabase is connected
const vods: Vod[] = [];

export async function GET() {
  return NextResponse.json(vods.sort((a, b) => b.matchDate.localeCompare(a.matchDate)));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = vodSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const vod: Vod = {
      id: crypto.randomUUID(),
      title: parsed.data.title,
      url: parsed.data.url,
      thumbnailUrl: parsed.data.thumbnailUrl || undefined,
      matchDate: parsed.data.matchDate,
      createdAt: new Date().toISOString(),
    };

    vods.push(vod);
    return NextResponse.json(vod, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rest } = body;
    const parsed = vodSchema.safeParse(rest);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const index = vods.findIndex((v) => v.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "VOD not found" }, { status: 404 });
    }

    vods[index] = {
      ...vods[index],
      title: parsed.data.title,
      url: parsed.data.url,
      thumbnailUrl: parsed.data.thumbnailUrl || undefined,
      matchDate: parsed.data.matchDate,
    };

    return NextResponse.json(vods[index]);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const index = vods.findIndex((v) => v.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "VOD not found" }, { status: 404 });
    }

    vods.splice(index, 1);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
