import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationTableRow } from "@/components/location-table-row";
import { db } from "@/lib/db";
import {
  locationsTable,
  rentalsTable,
  rentalPricesTable,
} from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";
import { formatPrice } from "@/lib/formatPrice";

type LocationWithData = {
  id: string;
  name: string;
  notes: string;
  averageRent: number;
  propertyCount: number;
  highlights: string[];
};

async function getLocationsWithData(): Promise<LocationWithData[]> {
  // Get all locations with rental counts and average prices
  const locationsData = await db
    .select({
      id: locationsTable.id,
      name: locationsTable.name,
      notes: locationsTable.notes,
      propertyCount: sql<number>`COUNT(DISTINCT ${rentalsTable.id})::int`,
      averageRent: sql<number>`COALESCE(AVG(${rentalPricesTable.monthlyRent})::int, 0)`,
    })
    .from(locationsTable)
    .leftJoin(rentalsTable, eq(locationsTable.id, rentalsTable.locationId))
    .leftJoin(
      rentalPricesTable,
      eq(locationsTable.id, rentalPricesTable.locationId),
    )
    .groupBy(locationsTable.id, locationsTable.name, locationsTable.notes);

  // Add highlights based on notes (you can customize this logic)
  return locationsData.map((location) => ({
    ...location,
    highlights: location.notes
      ? location.notes
          .split(",")
          .map((h) => h.trim())
          .filter(Boolean)
          .slice(0, 3)
      : [],
  }));
}

export default async function Locations() {
  const locations = await getLocationsWithData();

  const totalProperties = locations.reduce(
    (sum, loc) => sum + loc.propertyCount,
    0,
  );
  const overallAverageRent =
    locations.length > 0
      ? locations.reduce((sum, loc) => sum + loc.averageRent, 0) /
        locations.length
      : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="flex flex-col gap-4 max-w-6xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Seattle Rental Locations
          </h1>
          <p className="text-muted-foreground">
            Explore rental properties in Seattle's most popular neighborhoods
          </p>
        </div>

        {/* Locations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Select a Neighborhood</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 dark:text-gray-100">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 dark:text-gray-100">
                    Average Rent
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 dark:text-gray-100">
                    Properties
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 dark:text-gray-100">
                    Highlights
                  </th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <LocationTableRow key={location.id} location={location} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {locations.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Neighborhoods
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalProperties}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Properties
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatPrice(overallAverageRent)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average Rent
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
