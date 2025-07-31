
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { CalculateBmiInput, BmiResult } from '../../server/src/schema';

function App() {
  const [formData, setFormData] = useState<CalculateBmiInput>({
    height_cm: 0,
    weight_kg: 0
  });
  const [result, setResult] = useState<BmiResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCalculating(true);
    
    try {
      const bmiResult = await trpc.calculateBmi.mutate(formData);
      setResult(bmiResult);
    } catch (error) {
      console.error('Failed to calculate BMI:', error);
      setError('Failed to calculate BMI. Please check your input values.');
    } finally {
      setIsCalculating(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Underweight':
        return 'text-blue-600';
      case 'Normal':
        return 'text-green-600';
      case 'Overweight':
        return 'text-orange-600';
      case 'Obese':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">⚖️ IMC Calculator</h1>
          <p className="text-gray-600 mt-2">Calculate your Body Mass Index</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Your Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  value={formData.height_cm || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CalculateBmiInput) => ({ 
                      ...prev, 
                      height_cm: parseFloat(e.target.value) || 0 
                    }))
                  }
                  min="50"
                  max="300"
                  step="0.1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={formData.weight_kg || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CalculateBmiInput) => ({ 
                      ...prev, 
                      weight_kg: parseFloat(e.target.value) || 0 
                    }))
                  }
                  min="10"
                  max="500"
                  step="0.1"
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isCalculating || formData.height_cm <= 0 || formData.weight_kg <= 0}
              >
                {isCalculating ? 'Calculating...' : 'Calculate BMI'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Your BMI Result</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <div className="text-4xl font-bold text-gray-900">
                  {result.bmi_value}
                </div>
                <div className="text-sm text-gray-500 mt-1">BMI Value</div>
              </div>
              
              <div className={`text-xl font-semibold ${getCategoryColor(result.category)}`}>
                {result.category}
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <div>Height: {result.height_cm} cm</div>
                <div>Weight: {result.weight_kg} kg</div>
                <div>Calculated: {result.calculated_at.toLocaleDateString()}</div>
              </div>

              <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-md">
                <div className="font-medium mb-1">BMI Categories:</div>
                <div>Underweight: &lt; 18.5</div>
                <div>Normal: 18.5 - 24.9</div>
                <div>Overweight: 25.0 - 29.9</div>
                <div>Obese: ≥ 30.0</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;
