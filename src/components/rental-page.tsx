"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatPrice } from "@/lib/formatPrice";
import { formatDate } from "@/lib/formatDate";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
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
  unitType: string;
  floor: number | null;
};

type GroupedUnit = {
  sizeSqFt: number;
  monthlyRent: number;
  dateAvailable: string | null;
  unitType: string;
  floor: number | null;
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

function prepareChartData(prices: RentalPrice[]) {
  // Group prices by date and calculate average rent for each date
  const dateMap = new Map<number, { totalRent: number; count: number }>();

  for (const price of prices) {
    if (!dateMap.has(price.dateRecorded)) {
      dateMap.set(price.dateRecorded, { totalRent: 0, count: 0 });
    }
    const entry = dateMap.get(price.dateRecorded);
    if (entry) {
      entry.totalRent += price.monthlyRent;
      entry.count += 1;
    }
  }

  // Convert to array and calculate averages
  const chartData = Array.from(dateMap.entries())
    .map(([timestamp, { totalRent, count }]) => ({
      date: new Date(timestamp * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      timestamp,
      avgRent: Math.round(totalRent / count),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  return chartData;
}

function groupPricesByUnit(prices: RentalPrice[]): GroupedUnit[] {
  // Sort prices by date recorded (newest first)
  const sortedPrices = [...prices].sort(
    (a, b) => b.dateRecorded - a.dateRecorded,
  );

  // Group by unit characteristics (size, date available)
  const unitMap = new Map<string, GroupedUnit>();

  for (const price of sortedPrices) {
    const unitKey = `${price.sizeSqFt}-${price.dateAvailable || "null"}-${price.unitType}-${price.floor || "null"}`;

    if (!unitMap.has(unitKey)) {
      unitMap.set(unitKey, {
        sizeSqFt: price.sizeSqFt,
        monthlyRent: price.monthlyRent,
        dateAvailable: price.dateAvailable,
        unitType: price.unitType,
        floor: price.floor,
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

  // Convert to array and sort by monthly rent (ascending)
  return Array.from(unitMap.values()).sort(
    (a, b) => a.monthlyRent - b.monthlyRent,
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const groupedUnits = groupPricesByUnit(prices);
  const chartData = prepareChartData(prices);

  // Calculate summary statistics
  const avgRent =
    groupedUnits.length > 0
      ? groupedUnits.reduce((sum, unit) => sum + unit.monthlyRent, 0) /
        groupedUnits.length
      : 0;
  const avgRentPerSqFt =
    groupedUnits.length > 0
      ? groupedUnits.reduce(
          (sum, unit) => sum + unit.monthlyRent / unit.sizeSqFt,
          0,
        ) / groupedUnits.length
      : 0;

  const toggleRow = (unitKey: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(unitKey)) {
        newSet.delete(unitKey);
      } else {
        newSet.add(unitKey);
      }
      return newSet;
    });
  };

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

      {/* Summary Statistics */}
      {groupedUnits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Building Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Average Monthly Rent
                </h3>
                <p className="text-2xl font-bold">{formatPrice(avgRent)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Average Rent per Sq Ft
                </h3>
                <p className="text-2xl font-bold">
                  ${avgRentPerSqFt.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price History Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Average Rent Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                avgRent: {
                  label: "Average Rent",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      "Average Rent",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgRent"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

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
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12" />
                    <TableHead>Unit Type</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Sq Ft</TableHead>
                    <TableHead>Monthly Rent</TableHead>
                    <TableHead>$/Sq Ft</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead className="text-right">Price Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedUnits.map((unit) => {
                    const unitKey = `${unit.sizeSqFt}-${unit.dateAvailable || "null"}-${unit.unitType}-${unit.floor || "null"}`;
                    const isExpanded = expandedRows.has(unitKey);
                    const priceChanges = unit.priceHistory.length > 1;
                    const oldestPrice =
                      unit.priceHistory[unit.priceHistory.length - 1]
                        .monthlyRent;
                    const newestPrice = unit.priceHistory[0].monthlyRent;
                    const priceDiff = newestPrice - oldestPrice;
                    const rentPerSqFt = unit.monthlyRent / unit.sizeSqFt;

                    return (
                      <>
                        <TableRow
                          key={unitKey}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleRow(unitKey)}
                        >
                          <TableCell>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {unit.unitType || (
                              <span className="text-muted-foreground text-sm">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {unit.floor !== null ? (
                              unit.floor
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {unit.sizeSqFt} sq ft
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatPrice(unit.monthlyRent)}/mo
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            ${rentPerSqFt.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {unit.dateAvailable ? (
                              <Badge variant="outline" className="text-xs">
                                {unit.dateAvailable}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {priceChanges && priceDiff !== 0 ? (
                              <Badge
                                variant={
                                  priceDiff > 0 ? "destructive" : "default"
                                }
                              >
                                {priceDiff > 0 ? "+" : ""}
                                {formatPrice(priceDiff)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                No change
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/20 p-0">
                              <div className="px-12 py-4">
                                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                                  Price History ({unit.priceHistory.length}{" "}
                                  records)
                                </h4>
                                <div className="space-y-2">
                                  {unit.priceHistory.map((record, index) => (
                                    <div
                                      key={record.id}
                                      className="flex justify-between items-center text-sm py-2 px-4 rounded-md bg-background"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Badge
                                          variant="outline"
                                          className="font-mono"
                                        >
                                          #{index + 1}
                                        </Badge>
                                        <span className="text-muted-foreground">
                                          {formatDate(record.dateRecorded)}
                                        </span>
                                      </div>
                                      <span className="font-semibold">
                                        {formatPrice(record.monthlyRent)}/mo
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
