
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { bmiCalculationsTable } from '../db/schema';
import { type CalculateBmiInput } from '../schema';
import { calculateBmi } from '../handlers/calculate_bmi';
import { eq } from 'drizzle-orm';

describe('calculateBmi', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should calculate BMI correctly for normal weight', async () => {
    const input: CalculateBmiInput = {
      height_cm: 175,
      weight_kg: 70
    };

    const result = await calculateBmi(input);

    expect(result.height_cm).toEqual(175);
    expect(result.weight_kg).toEqual(70);
    expect(result.bmi_value).toEqual(22.86); // 70 / (1.75^2) = 22.857... rounded to 22.86
    expect(result.category).toEqual('Normal');
    expect(result.calculated_at).toBeInstanceOf(Date);
  });

  it('should categorize underweight BMI correctly', async () => {
    const input: CalculateBmiInput = {
      height_cm: 180,
      weight_kg: 55
    };

    const result = await calculateBmi(input);

    expect(result.bmi_value).toEqual(16.98); // 55 / (1.8^2) = 16.975... rounded to 16.98
    expect(result.category).toEqual('Underweight');
  });

  it('should categorize overweight BMI correctly', async () => {
    const input: CalculateBmiInput = {
      height_cm: 170,
      weight_kg: 80
    };

    const result = await calculateBmi(input);

    expect(result.bmi_value).toEqual(27.68); // 80 / (1.7^2) = 27.681... rounded to 27.68
    expect(result.category).toEqual('Overweight');
  });

  it('should categorize obese BMI correctly', async () => {
    const input: CalculateBmiInput = {
      height_cm: 165,
      weight_kg: 90
    };

    const result = await calculateBmi(input);

    expect(result.bmi_value).toEqual(33.06); // 90 / (1.65^2) = 33.057... rounded to 33.06
    expect(result.category).toEqual('Obese');
  });

  it('should save calculation to database', async () => {
    const input: CalculateBmiInput = {
      height_cm: 175,
      weight_kg: 70
    };

    await calculateBmi(input);

    const calculations = await db.select()
      .from(bmiCalculationsTable)
      .execute();

    expect(calculations).toHaveLength(1);
    expect(parseFloat(calculations[0].height_cm)).toEqual(175);
    expect(parseFloat(calculations[0].weight_kg)).toEqual(70);
    expect(parseFloat(calculations[0].bmi_value)).toEqual(22.86);
    expect(calculations[0].category).toEqual('Normal');
    expect(calculations[0].calculated_at).toBeInstanceOf(Date);
  });

  it('should handle edge case BMI values correctly', async () => {
    // Test boundary between Normal and Overweight (BMI just over 25)
    const input: CalculateBmiInput = {
      height_cm: 160,
      weight_kg: 64.1
    };

    const result = await calculateBmi(input);

    expect(result.bmi_value).toEqual(25.04); // 64.1 / (1.6^2) = 25.039... rounded to 25.04
    expect(result.category).toEqual('Overweight');
  });

  it('should round BMI values to 2 decimal places', async () => {
    const input: CalculateBmiInput = {
      height_cm: 173,
      weight_kg: 68.7
    };

    const result = await calculateBmi(input);

    // 68.7 / (1.73^2) = 22.954... should round to 22.95
    expect(result.bmi_value).toEqual(22.95);
    expect(typeof result.bmi_value).toBe('number');
  });

  it('should handle exact BMI boundary values', async () => {
    // Test exactly BMI = 25.00 (should be Normal, not Overweight)
    const input: CalculateBmiInput = {
      height_cm: 160,
      weight_kg: 64
    };

    const result = await calculateBmi(input);

    expect(result.bmi_value).toEqual(25.0); // 64 / (1.6^2) = 25.0 exactly
    expect(result.category).toEqual('Normal'); // BMI < 25 is Normal, BMI >= 25 is Overweight
  });
});
