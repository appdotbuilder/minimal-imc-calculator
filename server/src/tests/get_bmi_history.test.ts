
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { bmiCalculationsTable } from '../db/schema';
import { getBmiHistory } from '../handlers/get_bmi_history';

describe('getBmiHistory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no calculations exist', async () => {
    const result = await getBmiHistory();
    expect(result).toEqual([]);
  });

  it('should return all BMI calculations ordered by date (newest first)', async () => {
    // Create test calculations with specific timestamps
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(now);
    dayBefore.setDate(dayBefore.getDate() - 2);

    // Insert calculations in mixed order
    await db.insert(bmiCalculationsTable)
      .values([
        {
          height_cm: '175.50',
          weight_kg: '70.25',
          bmi_value: '22.86',
          category: 'Normal',
          calculated_at: dayBefore
        },
        {
          height_cm: '180.00',
          weight_kg: '85.00',
          bmi_value: '26.23',
          category: 'Overweight',
          calculated_at: now
        },
        {
          height_cm: '165.00',
          weight_kg: '55.00',
          bmi_value: '20.20',
          category: 'Normal',
          calculated_at: yesterday
        }
      ])
      .execute();

    const result = await getBmiHistory();

    expect(result).toHaveLength(3);

    // Verify ordering - newest first
    expect(result[0].calculated_at.getTime()).toBeGreaterThan(result[1].calculated_at.getTime());
    expect(result[1].calculated_at.getTime()).toBeGreaterThan(result[2].calculated_at.getTime());

    // Verify newest calculation details
    expect(result[0].height_cm).toEqual(180.00);
    expect(result[0].weight_kg).toEqual(85.00);
    expect(result[0].bmi_value).toEqual(26.23);
    expect(result[0].category).toEqual('Overweight');

    // Verify numeric conversions
    expect(typeof result[0].height_cm).toBe('number');
    expect(typeof result[0].weight_kg).toBe('number');
    expect(typeof result[0].bmi_value).toBe('number');
  });

  it('should handle single calculation correctly', async () => {
    await db.insert(bmiCalculationsTable)
      .values({
        height_cm: '170.00',
        weight_kg: '65.50',
        bmi_value: '22.65',
        category: 'Normal'
      })
      .execute();

    const result = await getBmiHistory();

    expect(result).toHaveLength(1);
    expect(result[0].height_cm).toEqual(170.00);
    expect(result[0].weight_kg).toEqual(65.50);
    expect(result[0].bmi_value).toEqual(22.65);
    expect(result[0].category).toEqual('Normal');
    expect(result[0].id).toBeDefined();
    expect(result[0].calculated_at).toBeInstanceOf(Date);
  });
});
