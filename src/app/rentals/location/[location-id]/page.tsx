import { db } from "@/lib/db";
import {
  locationsTable,
  rentalPricesTable,
  rentalsTable,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function LocationPage({
  params,
}: {
  params: Promise<{ "location-id": string }>;
}) {
  const paramsIn = await params;
  const locationId = paramsIn["location-id"];
  const location = await db
    .select()
    .from(locationsTable)
    .where(eq(locationsTable.id, locationId));
  const rentals = await db
    .select()
    .from(rentalsTable)
    .where(eq(rentalsTable.locationId, locationId));
  const rentalPrices = await db
    .select()
    .from(rentalPricesTable)
    .where(eq(rentalPricesTable.locationId, locationId));

  return <div>Rental Location Details Page for {JSON.stringify(location)}</div>;
}
