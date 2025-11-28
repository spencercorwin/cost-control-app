import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { rentalsTable, rentalPricesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import firecrawl from "@/lib/firecrawl/index";
import z from "zod";

type Unit = {
  monthly_rent: number;
  date_available?: string;
  square_footage: number;
  unit_type: string;
  notes: string;
  floor?: number;
  is_income_restricted?: boolean;
};

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Fetch the rental from the database
    const rental = await db
      .select()
      .from(rentalsTable)
      .where(eq(rentalsTable.id, id))
      .limit(1);

    if (rental.length === 0 || !rental[0].url) {
      return NextResponse.json(
        { error: "Rental not found or missing URL" },
        { status: 404 },
      );
    }

    const rentalUrl = rental[0].url;
    const locationId = rental[0].locationId;

    console.log("Initiating scrape for rental ID:", id);

    // Scrape the URL using Firecrawl with extraction schema
    const scrapeResult = await firecrawl.scrape(rentalUrl, {
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

    console.log("Scrape result for rental ID:", id);
    console.dir(scrapeResult, { depth: null });

    // Extract units from the scrape result
    const data = scrapeResult.json;
    const parseResult = responseSchema.safeParse(scrapeResult);
    if (!parseResult.success) {
      console.error("Scrape result validation failed:", parseResult.error);
      return NextResponse.json(
        { error: "Invalid scrape result format" },
        { status: 500 },
      );
    }
    const units = parseResult.data.json.units;

    if (!units || units.length === 0) {
      return NextResponse.json(
        { error: "No units found in scrape result" },
        { status: 400 },
      );
    }

    // Insert units into the database
    const dateRecorded = Math.floor(Date.now() / 1000);
    const insertPromises = units
      .filter((unit) => unit.is_income_restricted !== true)
      .filter((unit) => unit.monthly_rent > 0)
      .map((unit) =>
        db.insert(rentalPricesTable).values({
          rentalId: id,
          locationId: locationId,
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

    console.log(
      "Inserting",
      units.length,
      "units into the database for rental ID:",
      id,
    );

    await Promise.all(insertPromises);

    return NextResponse.json({
      success: true,
      message: `Successfully scraped and saved ${units.length} units`,
      unitsCount: units.length,
    });
  } catch (error) {
    console.error("Error scraping rental:", error);
    return NextResponse.json(
      {
        error: "Failed to scrape rental",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
