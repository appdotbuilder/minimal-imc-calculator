
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { bmiCalculationsTable } from '../db/schema';
import { type CalculateBmiInput } from '../schema';
import { saveBmiCalculation } from '../handlers/save_bmi_calculation';
import { eq } from 'drizzle-orm';

// Test input with BMI calculation data
const testInput: CalculateBmiInput & { bmi_value: number; category: string } = {
  height_cm: 175.5,
  weight_kg: 70.25,
  bmi_value: 22.86,
  category: 'Normal'
};

describe('saveBmiCalculation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should save a BMI calculation', async () => {
    const result = await saveBmiCalculation(testInput);

    // Basic field validation
    expect(result.height_cm).toEqual(175.5);
    expect(result.weight_kg).toEqual(70.25);
    expect(result.bmi_value).toEqual(22.86);
    expect(result.category).toEqual('Normal');
    expect(result.id).toBeDefined();
    expect(result.calculated_at).toBeInstanceOf(Date);

    // Verify numeric types
    expect(typeof result.height_cm).toBe('number');
    expect(typeof result.weight_kg).toBe('number');
    expect(typeof result.bmi_value).toBe('number');
  });

  it('should save calculation to database', async () => {
    const result = await saveBmiCalculation(testInput);

    // Query using proper drizzle syntax
    const calculations = await db.select()
      .from(bmiCalculationsTable)
      .where(eq(bmiCalculationsTable.id, result.id))
      .execute();

    expect(calculations).toHaveLength(1);
    expect(parseFloat(calculations[0].height_cm)).toEqual(175.5);
    expect(parseFloat(calculations[0].weight_kg)).toEqual(70.25);
    expect(parseFloat(calculations[0].bmi_value)).toEqual(22.86);
    expect(calculations[0].category).toEqual('Normal');
    expect(calculations[0].calculated_at).toBeInstanceOf(Date);
  });

  it('should handle different BMI categories', async () => {
    const underweightInput = {
      ...testInput,
      weight_kg: 45.0,
      bmi_value: 14.61,
      category: 'Underweight'
    };

    const result = await saveBmiCalculation(underweightInput);

    expect(result.weight_kg).toEqual(45.0);
    expect(result.bmi_value).toEqual(14.61);
    expect(result.category).toEqual('Underweight');
  });

  it('should handle decimal precision correctly', async () => {
    // Use values that match the database precision (2 decimal places)
    const preciseInput = {
      height_cm: 182.75,
      weight_kg: 75.12, // 2 decimal places to match numeric(5,2)
      bmi_value: 22.50, // 2 decimal places to match numeric(5,2)
      category: 'Normal'
    };

    const result = await saveBmiCalculation(preciseInput);

    // Verify decimal precision is maintained
    expect(result.height_cm).toEqual(182.75);
    expect(result.weight_kg).toEqual(75.12);
    expect(result.bmi_value).toEqual(22.50);

    // Verify database storage maintains precision
    const calculations = await db.select()
      .from(bmiCalculationsTable)
      .where(eq(bmiCalculationsTable.id, result.id))
      .execute();

    expect(parseFloat(calculations[0].height_cm)).toEqual(182.75);
    expect(parseFloat(calculations[0].weight_kg)).toEqual(75.12);
    expect(parseFloat(calculations[0].bmi_value)).toEqual(22.50);
  });
});
