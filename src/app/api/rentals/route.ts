import { eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { locationsTable, rentalsTable } from "@/lib/db/schema";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  // create rental
  const body = await request.json();
  const createLocationSchema = z.object({
    id: z.string(),
    propertyName: z.string().min(1),
    locationId: z.string(),
    description: z.string().optional(),
    latitude: z.string(),
    longitude: z.string(),
    propertyAddress: z.string().min(1),
  });
  // check if this location id already exists
  const maybeExistingLocation = await db
    .select()
    .from(rentalsTable)
    .where(eq(rentalsTable.propertyName, body.propertyName))
    .limit(1);
  if (maybeExistingLocation.length > 0) {
    return NextResponse.json(
      { error: "Rental with this name already exists" },
      { status: 400 },
    );
  }

  // check that location ID exists
  const maybeLocation = await db
    .select()
    .from(locationsTable)
    .where(eq(locationsTable.id, body.locationId))
    .limit(1);
  if (maybeLocation.length === 0) {
    return NextResponse.json(
      { error: "Location with this ID does not exist" },
      { status: 400 },
    );
  }

  const parsedBody = createLocationSchema.parse(body);

  const newRental = await db
    .insert(rentalsTable)
    .values({
      id: parsedBody.id,
      propertyName: parsedBody.propertyName,
      propertyAddress: parsedBody.propertyAddress,
      locationId: parsedBody.locationId,
      latitude: parsedBody.latitude.toString(),
      longitude: parsedBody.longitude.toString(),
      notes: parsedBody.description || "",
    })
    .returning();

  return NextResponse.json({ location: newRental });
}
