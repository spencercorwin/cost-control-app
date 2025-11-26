import { eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { locationsTable } from "@/lib/db/schema";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  // create location
  // needs ID, name, notes, latitude, longitude
  const body = await request.json();
  const createLocationSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    description: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
  });
  // check if this location id already exists
  const maybeExistingLocation = await db
    .select()
    .from(locationsTable)
    .where(eq(locationsTable.name, body.name))
    .limit(1);
  if (maybeExistingLocation.length > 0) {
    return NextResponse.json(
      { error: "Location with this name already exists" },
      { status: 400 },
    );
  }

  const parsedBody = createLocationSchema.parse(body);

  const newLocation = await db
    .insert(locationsTable)
    .values({
      id: parsedBody.id,
      name: parsedBody.name,
      latitude: parsedBody.latitude.toString(),
      longitude: parsedBody.longitude.toString(),
      notes: parsedBody.description || "",
    })
    .returning();

  return NextResponse.json({ location: newLocation });
}
