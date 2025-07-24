
import { db } from '../db';
import { bmiCalculationsTable } from '../db/schema';
import { type CalculateBmiInput, type BmiCalculation } from '../schema';

export const saveBmiCalculation = async (input: CalculateBmiInput & { bmi_value: number; category: string }): Promise<BmiCalculation> => {
  try {
    // Insert BMI calculation record
    const result = await db.insert(bmiCalculationsTable)
      .values({
        height_cm: input.height_cm.toString(), // Convert number to string for numeric column
        weight_kg: input.weight_kg.toString(), // Convert number to string for numeric column
        bmi_value: input.bmi_value.toString(), // Convert number to string for numeric column
        category: input.category
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const calculation = result[0];
    return {
      ...calculation,
      height_cm: parseFloat(calculation.height_cm), // Convert string back to number
      weight_kg: parseFloat(calculation.weight_kg), // Convert string back to number
      bmi_value: parseFloat(calculation.bmi_value) // Convert string back to number
    };
  } catch (error) {
    console.error('BMI calculation save failed:', error);
    throw error;
  }
};
