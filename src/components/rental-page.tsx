"use client";

import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import { formatDate } from "@/lib/formatDate";
import { ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type RentalPrice = {
  id: number;
  rentalId: string;
  locationId: string;
  sizeSqFt: number;
  monthlyRent: number;
  dateAvailable: string | null;
  dateRecorded: number;
};

type GroupedUnit = {
  sizeSqFt: number;
  monthlyRent: number;
  dateAvailable: string | null;
  priceHistory: Array<{
    id: number;
    dateRecorded: number;
    monthlyRent: number;
  }>;
  latestRecordedDate: number;
};

type Rental = {
  id: string;
  locationId: string;
  propertyAddress: string;
  url: string;
  latitude: string;
  longitude: string;
  propertyName: string;
  notes: string;
};

function groupPricesByUnit(prices: RentalPrice[]): GroupedUnit[] {
  // Sort prices by date recorded (newest first)
  const sortedPrices = [...prices].sort(
    (a, b) => b.dateRecorded - a.dateRecorded,
  );

  // Group by unit characteristics (size, date available)
  const unitMap = new Map<string, GroupedUnit>();

  for (const price of sortedPrices) {
    const unitKey = `${price.sizeSqFt}-${price.dateAvailable || "null"}`;

    if (!unitMap.has(unitKey)) {
      unitMap.set(unitKey, {
        sizeSqFt: price.sizeSqFt,
        monthlyRent: price.monthlyRent,
        dateAvailable: price.dateAvailable,
        priceHistory: [],
        latestRecordedDate: price.dateRecorded,
      });
    }

    const unit = unitMap.get(unitKey);
    if (unit) {
      unit.priceHistory.push({
        id: price.id,
        dateRecorded: price.dateRecorded,
        monthlyRent: price.monthlyRent,
      });
    }
  }

  // Convert to array and sort by latest recorded date
  return Array.from(unitMap.values()).sort(
    (a, b) => b.latestRecordedDate - a.latestRecordedDate,
  );
}

export default function RentalPage({
  rental,
  prices,
}: {
  rental: Rental;
  prices: RentalPrice[];
}) {
  const router = useRouter();
  const [isScraing, setIsScraping] = useState(false);
  const groupedUnits = groupPricesByUnit(prices);

  const handleScrape = async () => {
    setIsScraping(true);
    try {
      const response = await fetch(`/api/rentals/${rental.id}/scrape`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to scrape rental");
      }

      toast.success(data.message || "Scrape completed successfully");

      // Refresh the page to show new data
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to scrape rental",
      );
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Rental Information */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-3xl">{rental.propertyName}</CardTitle>
            {rental.url && (
              <Button
                onClick={handleScrape}
                disabled={isScraing}
                variant="outline"
                size="sm"
              >
                {isScraing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Scrape Latest Prices
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Address
            </h3>
            <p className="text-lg">{rental.propertyAddress}</p>
          </div>

          {rental.notes && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Notes
              </h3>
              <p className="text-base">{rental.notes}</p>
            </div>
          )}

          {rental.url && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Listing
              </h3>
              <a
                href={rental.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
              >
                View Original Listing
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Units and Price History */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Available Units & Price History
        </h2>
        {groupedUnits.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No pricing data available for this rental.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {groupedUnits.map((unit) => {
              const priceChanges = unit.priceHistory.length > 1;
              const oldestPrice =
                unit.priceHistory[unit.priceHistory.length - 1].monthlyRent;
              const newestPrice = unit.priceHistory[0].monthlyRent;
              const priceDiff = newestPrice - oldestPrice;
              const unitKey = `${unit.sizeSqFt}-${unit.dateAvailable || "null"}`;

              return (
                <Card key={unitKey}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {unit.sizeSqFt} sq ft
                        </CardTitle>
                        <p className="text-2xl font-bold mt-1">
                          {formatPrice(unit.monthlyRent)}/mo
                        </p>
                      </div>
                      <div className="text-right">
                        {unit.dateAvailable && (
                          <Badge variant="outline" className="mb-2">
                            Available: {unit.dateAvailable}
                          </Badge>
                        )}
                        {priceChanges && priceDiff !== 0 && (
                          <Badge
                            variant={priceDiff > 0 ? "destructive" : "default"}
                            className="ml-2"
                          >
                            {priceDiff > 0 ? "+" : ""}
                            {formatPrice(priceDiff)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {unit.priceHistory.length > 1 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Price History ({unit.priceHistory.length} records)
                        </h4>
                        <div className="space-y-1">
                          {unit.priceHistory.map((record) => (
                            <div
                              key={record.id}
                              className="flex justify-between items-center text-sm py-1 border-b last:border-b-0"
                            >
                              <span className="text-muted-foreground">
                                {formatDate(record.dateRecorded)}
                              </span>
                              <span className="font-medium">
                                {formatPrice(record.monthlyRent)}/mo
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {unit.priceHistory.length === 1 && (
                      <p className="text-sm text-muted-foreground">
                        Recorded on{" "}
                        {formatDate(unit.priceHistory[0].dateRecorded)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
