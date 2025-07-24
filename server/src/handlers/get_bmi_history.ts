
import { db } from '../db';
import { bmiCalculationsTable } from '../db/schema';
import { type BmiCalculation } from '../schema';
import { desc } from 'drizzle-orm';

export const getBmiHistory = async (): Promise<BmiCalculation[]> => {
  try {
    const results = await db.select()
      .from(bmiCalculationsTable)
      .orderBy(desc(bmiCalculationsTable.calculated_at))
      .execute();

    // Convert numeric fields back to numbers for all results
    return results.map(calculation => ({
      ...calculation,
      height_cm: parseFloat(calculation.height_cm),
      weight_kg: parseFloat(calculation.weight_kg),
      bmi_value: parseFloat(calculation.bmi_value)
    }));
  } catch (error) {
    console.error('BMI history retrieval failed:', error);
    throw error;
  }
};
