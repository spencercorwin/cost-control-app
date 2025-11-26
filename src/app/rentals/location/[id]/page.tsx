import { db } from "@/lib/db";
import {
  locationsTable,
  rentalPricesTable,
  rentalsTable,
} from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RentalTableRow } from "@/components/rental-table-row";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/formatPrice";

type RentalWithLatestPrice = {
  id: string;
  propertyName: string;
  propertyAddress: string;
  url: string;
  notes: string;
  latestPrice?: {
    monthlyRent: number;
    sizeSqFt: number;
    dateAvailable: string | null;
    dateRecorded: number;
  } | null;
};

async function getLocationWithRentals(locationId: string) {
  // Get location details
  const locations = await db
    .select()
    .from(locationsTable)
    .where(eq(locationsTable.id, locationId));

  if (locations.length === 0) {
    return null;
  }

  const location = locations[0];

  // Get all rentals for this location
  const rentals = await db
    .select()
    .from(rentalsTable)
    .where(eq(rentalsTable.locationId, locationId));

  // For each rental, get the latest price
  const rentalsWithPrices: RentalWithLatestPrice[] = await Promise.all(
    rentals.map(async (rental) => {
      const latestPrices = await db
        .select()
        .from(rentalPricesTable)
        .where(eq(rentalPricesTable.rentalId, rental.id))
        .orderBy(desc(rentalPricesTable.dateRecorded))
        .limit(1);

      return {
        id: rental.id,
        propertyName: rental.propertyName,
        propertyAddress: rental.propertyAddress,
        url: rental.url,
        notes: rental.notes,
        latestPrice:
          latestPrices.length > 0
            ? {
                monthlyRent: latestPrices[0].monthlyRent,
                sizeSqFt: latestPrices[0].sizeSqFt,
                dateAvailable: latestPrices[0].dateAvailable,
                dateRecorded: latestPrices[0].dateRecorded,
              }
            : null,
      };
    }),
  );

  return {
    location,
    rentals: rentalsWithPrices,
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const paramsIn = await params;
  const locationId = paramsIn.id;

  const data = await getLocationWithRentals(locationId);

  if (!data) {
    notFound();
  }

  const { location, rentals } = data;

  // Calculate stats
  const rentalsWithPrices = rentals.filter((r) => r.latestPrice);
  const averageRent =
    rentalsWithPrices.length > 0
      ? rentalsWithPrices.reduce(
          (sum, r) => sum + (r.latestPrice?.monthlyRent || 0),
          0,
        ) / rentalsWithPrices.length
      : 0;
  const averageSize =
    rentalsWithPrices.length > 0
      ? rentalsWithPrices.reduce(
          (sum, r) => sum + (r.latestPrice?.sizeSqFt || 0),
          0,
        ) / rentalsWithPrices.length
      : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="flex flex-col gap-4 max-w-6xl mx-auto">
        {/* Location Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {location.name}
          </h1>
          {location.notes && (
            <p className="text-muted-foreground">{location.notes}</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {rentals.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Rentals
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatPrice(averageRent)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average Rent
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(averageSize).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Size (sq ft)
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rentals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Available Rentals</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {rentals.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 dark:text-gray-100">
                      Property
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 dark:text-gray-100">
                      Latest Price
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 dark:text-gray-100">
                      Availability
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 dark:text-gray-100">
                      Link
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map((rental) => (
                    <RentalTableRow key={rental.id} rental={rental} />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No rentals found for this location.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
