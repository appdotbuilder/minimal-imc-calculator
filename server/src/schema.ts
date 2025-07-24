
import { z } from 'zod';

// BMI calculation input schema
export const calculateBmiInputSchema = z.object({
  height_cm: z.number().positive().min(50).max(300), // Height in centimeters, reasonable human range
  weight_kg: z.number().positive().min(10).max(500), // Weight in kilograms, reasonable human range
});

export type CalculateBmiInput = z.infer<typeof calculateBmiInputSchema>;

// BMI result schema
export const bmiResultSchema = z.object({
  height_cm: z.number(),
  weight_kg: z.number(),
  bmi_value: z.number(),
  category: z.string(),
  calculated_at: z.coerce.date(),
});

export type BmiResult = z.infer<typeof bmiResultSchema>;

// BMI calculation history schema (for database storage)
export const bmiCalculationSchema = z.object({
  id: z.number(),
  height_cm: z.number(),
  weight_kg: z.number(),
  bmi_value: z.number(),
  category: z.string(),
  calculated_at: z.coerce.date(),
});

export type BmiCalculation = z.infer<typeof bmiCalculationSchema>;
