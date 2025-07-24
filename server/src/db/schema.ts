
import { serial, text, pgTable, timestamp, numeric } from 'drizzle-orm/pg-core';

export const bmiCalculationsTable = pgTable('bmi_calculations', {
  id: serial('id').primaryKey(),
  height_cm: numeric('height_cm', { precision: 5, scale: 2 }).notNull(), // e.g., 175.50 cm
  weight_kg: numeric('weight_kg', { precision: 5, scale: 2 }).notNull(), // e.g., 70.25 kg
  bmi_value: numeric('bmi_value', { precision: 5, scale: 2 }).notNull(), // e.g., 22.86
  category: text('category').notNull(), // BMI category like "Normal", "Overweight"
  calculated_at: timestamp('calculated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type BmiCalculation = typeof bmiCalculationsTable.$inferSelect;
export type NewBmiCalculation = typeof bmiCalculationsTable.$inferInsert;

// Export all tables for proper query building
export const tables = { bmiCalculations: bmiCalculationsTable };
