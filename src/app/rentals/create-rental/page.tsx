import { db } from "@/lib/db";
import { locationsTable } from "@/lib/db/schema";
import { CreateRentalForm } from "@/components/create-rental-form";

async function getLocations() {
  const locations = await db.select().from(locationsTable);
  return locations;
}

export default async function CreateRental() {
  const locations = await getLocations();

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <CreateRentalForm locations={locations} />
    </div>
  );
}
