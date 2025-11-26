import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const locationsTable = pgTable("locations", {
  id: varchar().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  notes: varchar().notNull(),
  latitude: varchar({ length: 50 }).notNull(),
  longitude: varchar({ length: 50 }).notNull(),
});

export const rentalsTable = pgTable("rentals", {
  id: varchar().primaryKey(),
  locationId: varchar()
    .notNull()
    .references(() => locationsTable.id),
  propertyName: varchar().notNull(),
  notes: varchar().notNull(),
});

export const rentalPricesTable = pgTable("rental_prices", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  rentalId: varchar()
    .notNull()
    .references(() => rentalsTable.id),
  locationId: varchar()
    .notNull()
    .references(() => locationsTable.id),
  sizeSqFt: integer().notNull(),
  monthlyRent: integer().notNull(),
  dateAvailable: varchar({ length: 50 }).notNull(),
  pricePerMonth: integer().notNull(),
  dateRecorded: varchar({ length: 50 }).notNull(),
});
