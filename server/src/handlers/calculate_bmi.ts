
import { db } from '../db';
import { bmiCalculationsTable } from '../db/schema';
import { type CalculateBmiInput, type BmiResult } from '../schema';

export async function calculateBmi(input: CalculateBmiInput): Promise<BmiResult> {
  try {
    const { height_cm, weight_kg } = input;
    
    // BMI formula: weight (kg) / (height (m))^2
    const height_m = height_cm / 100;
    const bmi_value = weight_kg / (height_m * height_m);
    
    // Determine BMI category based on standard ranges
    let category: string;
    if (bmi_value < 18.5) {
      category = 'Underweight';
    } else if (bmi_value < 25) {
      category = 'Normal';
    } else if (bmi_value < 30) {
      category = 'Overweight';
    } else {
      category = 'Obese';
    }

    // Round BMI to 2 decimal places
    const rounded_bmi = Math.round(bmi_value * 100) / 100;
    
    // Save calculation to database
    await db.insert(bmiCalculationsTable)
      .values({
        height_cm: height_cm.toString(),
        weight_kg: weight_kg.toString(),
        bmi_value: rounded_bmi.toString(),
        category: category
      })
      .execute();
    
    return {
      height_cm,
      weight_kg,
      bmi_value: rounded_bmi,
      category,
      calculated_at: new Date()
    };
  } catch (error) {
    console.error('BMI calculation failed:', error);
    throw error;
  }
}
