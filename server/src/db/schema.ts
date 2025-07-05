
import { uuid, text, pgTable, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const apiDesignsTable = pgTable('api_designs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  design_data: jsonb('design_data').notNull(), // JSONB for React Flow state
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type ApiDesign = typeof apiDesignsTable.$inferSelect; // For SELECT operations
export type NewApiDesign = typeof apiDesignsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { apiDesigns: apiDesignsTable };
