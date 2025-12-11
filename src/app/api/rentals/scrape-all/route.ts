import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { rentalsTable, rentalPricesTable } from "@/lib/db/schema";
import { isNotNull } from "drizzle-orm";
import firecrawl from "@/lib/firecrawl/index";
import z from "zod";

const responseSchema = z.object({
  json: z.object({
    units: z.array(
      z.object({
        monthly_rent: z.number(),
        date_available: z.string().optional(),
        square_footage: z.number(),
        unit_type: z.string(),
        notes: z.string(),
        floor: z.number().optional(),
        is_income_restricted: z.boolean().optional(),
      }),
    ),
  }),
});

export async function POST() {
  try {
    // Fetch all rentals that have a URL
    const rentals = await db
      .select()
      .from(rentalsTable)
      .where(isNotNull(rentalsTable.url));

    if (rentals.length === 0) {
      return NextResponse.json(
        { error: "No rentals with URLs found" },
        { status: 404 },
      );
    }

    const results: {
      rentalId: string;
      propertyName: string;
      success: boolean;
      unitsCount?: number;
      error?: string;
    }[] = [];

    // Process each rental sequentially to avoid rate limiting
    for (const rental of rentals) {
      if (!rental.url) {
        results.push({
          rentalId: rental.id,
          propertyName: rental.propertyName,
          success: false,
          error: "Missing URL",
        });
        continue;
      }

      try {
        console.log(
          `Scraping rental: ${rental.propertyName} (ID: ${rental.id})`,
        );

        // Scrape the URL using Firecrawl with extraction schema
        const scrapeResult = await firecrawl.scrape(rental.url, {
          waitFor: 2000,
          formats: [
            {
              type: "json",
              prompt:
                "Get all the rental unit details available on the page. Only return units that are one bedroom.",
              schema: {
                type: "object",
                properties: {
                  units: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        monthly_rent: {
                          type: "number",
                          description: "Monthly rent amount in dollars",
                        },
                        date_available: {
                          type: "string",
                          description: "Date when the unit becomes available",
                        },
                        square_footage: {
                          type: "number",
                          description: "Square footage of the unit",
                        },
                        unit_type: {
                          type: "string",
                          description:
                            "Type of unit (e.g., studio, 1BR, 2BR, etc.)",
                        },
                        notes: {
                          type: "string",
                          description: "Additional notes about the unit",
                        },
                        floor: {
                          type: "number",
                          description: "Floor number of the unit",
                        },
                        is_income_restricted: {
                          type: "boolean",
                          description: "Whether the unit is income restricted",
                        },
                      },
                      required: ["monthly_rent", "square_footage", "unit_type"],
                    },
                  },
                },
                required: ["units"],
              },
            },
          ],
        });

        console.log(`Scrape completed for: ${rental.propertyName}`);

        const parseResult = responseSchema.safeParse(scrapeResult);
        if (!parseResult.success) {
          console.error(
            `Validation failed for ${rental.propertyName}:`,
            parseResult.error,
          );
          results.push({
            rentalId: rental.id,
            propertyName: rental.propertyName,
            success: false,
            error: "Invalid scrape result format",
          });
          continue;
        }

        const units = parseResult.data.json.units;

        if (!units || units.length === 0) {
          results.push({
            rentalId: rental.id,
            propertyName: rental.propertyName,
            success: false,
            error: "No units found",
          });
          continue;
        }

        // Insert units into the database
        const dateRecorded = Math.floor(Date.now() / 1000);
        const filteredUnits = units
          .filter((unit) => unit.is_income_restricted !== true)
          .filter((unit) => unit.monthly_rent > 0);

        const insertPromises = filteredUnits.map((unit) =>
          db.insert(rentalPricesTable).values({
            rentalId: rental.id,
            locationId: rental.locationId,
            sizeSqFt: unit.square_footage,
            monthlyRent: unit.monthly_rent,
            dateAvailable: unit.date_available || null,
            dateRecorded: dateRecorded,
            unitType: unit.unit_type,
            notes: unit.notes,
            floor: unit.floor || null,
            isIncomeRestricted: unit.is_income_restricted || null,
          }),
        );

        await Promise.all(insertPromises);

        results.push({
          rentalId: rental.id,
          propertyName: rental.propertyName,
          success: true,
          unitsCount: filteredUnits.length,
        });

        console.log(
          `Saved ${filteredUnits.length} units for: ${rental.propertyName}`,
        );
      } catch (error) {
        console.error(`Error scraping ${rental.propertyName}:`, error);
        results.push({
          rentalId: rental.id,
          propertyName: rental.propertyName,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const totalUnits = results.reduce((sum, r) => sum + (r.unitsCount || 0), 0);

    return NextResponse.json({
      success: true,
      message: `Scraped ${successCount}/${rentals.length} rentals, saved ${totalUnits} total units`,
      results,
    });
  } catch (error) {
    console.error("Error in scrape-all:", error);
    return NextResponse.json(
      {
        error: "Failed to scrape rentals",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
