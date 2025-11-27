import { db } from "@/lib/db/index";
import { rentalsTable, rentalPricesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import RentalPage from "@/components/rental-page";

async function getRentalData(id: string) {
  const rental = await db
    .select()
    .from(rentalsTable)
    .where(eq(rentalsTable.id, id))
    .limit(1);

  if (rental.length === 0) {
    return null;
  }

  const prices = await db
    .select()
    .from(rentalPricesTable)
    .where(eq(rentalPricesTable.rentalId, id));

  return { rental: rental[0], prices };
}

export default async function Rental({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getRentalData(id);

  if (!data) {
    notFound();
  }

  const { rental, prices } = data;

  return <RentalPage rental={rental} prices={prices} />;
}
