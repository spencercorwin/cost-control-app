"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ScrapeResult = {
  rentalId: string;
  propertyName: string;
  success: boolean;
  unitsCount?: number;
  error?: string;
};

type ScrapeAllResponse = {
  success: boolean;
  message: string;
  results: ScrapeResult[];
};

export function ScrapeAllButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleScrapeAll() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/rentals/scrape-all", {
        method: "POST",
      });

      const data: ScrapeAllResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to scrape rentals");
      }

      const successCount = data.results.filter((r) => r.success).length;
      const failedCount = data.results.filter((r) => !r.success).length;

      if (failedCount > 0) {
        toast.warning(data.message, {
          description: `${failedCount} rental(s) failed to scrape`,
        });
      } else {
        toast.success(data.message);
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error scraping all rentals:", error);
      toast.error("Failed to scrape rentals", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button onClick={handleScrapeAll} disabled={isLoading} variant="outline">
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Scraping...
        </>
      ) : (
        "Scrape All Rentals"
      )}
    </Button>
  );
}
