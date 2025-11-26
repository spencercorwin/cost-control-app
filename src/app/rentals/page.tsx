"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Location = {
  id: string;
  name: string;
  description: string;
  averageRent: number;
  propertyCount: number;
  coordinates: { lat: number; lng: number };
  highlights: string[];
};

// Seattle neighborhood data
const seattleLocations: Location[] = [
  {
    id: "south-lake-union",
    name: "South Lake Union",
    description:
      "Tech hub with modern amenities, close to Amazon and other major companies.",
    averageRent: 3200,
    propertyCount: 45,
    coordinates: { lat: 47.6205, lng: -122.337 },
    highlights: [
      "Tech companies nearby",
      "Modern apartments",
      "Great dining scene",
    ],
  },
  {
    id: "kirkland",
    name: "Kirkland",
    description:
      "Quiet suburban area across Lake Washington with waterfront views.",
    averageRent: 2800,
    propertyCount: 32,
    coordinates: { lat: 47.6815, lng: -122.2087 },
    highlights: ["Lakefront living", "Family-friendly", "Good schools"],
  },
  {
    id: "west-seattle",
    name: "West Seattle",
    description:
      "Beach community with a small-town feel and great views of downtown.",
    averageRent: 2400,
    propertyCount: 28,
    coordinates: { lat: 47.565, lng: -122.385 },
    highlights: ["Beach access", "Community feel", "Affordable options"],
  },
  {
    id: "bellevue",
    name: "Bellevue",
    description: "Upscale suburban city with excellent shopping and dining.",
    averageRent: 3500,
    propertyCount: 38,
    coordinates: { lat: 47.6101, lng: -122.2015 },
    highlights: ["Luxury living", "Shopping centers", "Top-rated schools"],
  },
  {
    id: "downtown",
    name: "Downtown Seattle",
    description:
      "Urban core with high-rise living, entertainment, and business district.",
    averageRent: 3800,
    propertyCount: 67,
    coordinates: { lat: 47.6062, lng: -122.3321 },
    highlights: ["City center", "High-rise living", "Public transit"],
  },
];

export default function Rentals() {
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleLocationClick = (locationId: string) => {
    router.push(`/rentals/location/${locationId}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent, locationId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleLocationClick(locationId);
    }
  };

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
                {seattleLocations.map((location) => (
                  <tr
                    key={location.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-800/50 transition-colors"
                    onClick={() => handleLocationClick(location.id)}
                    onKeyDown={(e) => handleKeyDown(e, location.id)}
                    tabIndex={0}
                    aria-label={`View rentals in ${location.name}`}
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {location.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {location.description}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-green-600 dark:text-green-400">
                      {formatPrice(location.averageRent)}
                    </td>
                    <td className="py-4 px-4 text-gray-900 dark:text-gray-100">
                      {location.propertyCount} available
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {location.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
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
                {seattleLocations.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Neighborhoods
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {seattleLocations.reduce(
                  (sum, loc) => sum + loc.propertyCount,
                  0,
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Properties
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatPrice(
                  seattleLocations.reduce(
                    (sum, loc) => sum + loc.averageRent,
                    0,
                  ) / seattleLocations.length,
                )}
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
