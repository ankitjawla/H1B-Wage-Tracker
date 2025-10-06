import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ConfusionMatrix = memo(function ConfusionMatrix({ confusionMatrix }) {
  const outcomes = ['uswin', 'euwin', 'draw'];
  const outcomeLabels = {
    'uswin': 'US Win',
    'euwin': 'EU Win',
    'draw': 'Draw'
  };

  const getIntensity = (value, max) => {
    const intensity = value / max;
    if (intensity === 0) return 'bg-gray-100';
    if (intensity <= 0.2) return 'bg-blue-100';
    if (intensity <= 0.4) return 'bg-blue-200';
    if (intensity <= 0.6) return 'bg-blue-300';
    if (intensity <= 0.8) return 'bg-blue-400';
    return 'bg-blue-500';
  };

  const getTextColor = (value, max) => {
    const intensity = value / max;
    return intensity > 0.6 ? 'text-white' : 'text-gray-800';
  };

  // Find max value for color scaling
  const maxValue = Math.max(
    ...outcomes.flatMap(predicted => 
      outcomes.map(actual => confusionMatrix[predicted]?.[actual] || 0)
    )
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Confusion Matrix</CardTitle>
        <CardDescription>
          Predicted vs Actual outcomes - diagonal cells show correct predictions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid grid-cols-4 gap-1 text-sm">
              {/* Header row */}
              <div className="p-3 font-medium text-center"></div>
              {outcomes.map(outcome => (
                <div key={outcome} className="p-3 font-medium text-center bg-gray-50 rounded">
                  Actual {outcomeLabels[outcome]}
                </div>
              ))}
              
              {/* Data rows */}
              {outcomes.map(predicted => (
                <div key={predicted} className="contents">
                  <div className="p-3 font-medium text-center bg-gray-50 rounded">
                    Predicted {outcomeLabels[predicted]}
                  </div>
                  {outcomes.map(actual => {
                    const value = confusionMatrix[predicted]?.[actual] || 0;
                    const isCorrect = predicted === actual;
                    return (
                      <div
                        key={`${predicted}-${actual}`}
                        className={`
                          p-3 text-center rounded border-2 transition-all duration-200 hover:scale-105
                          ${getIntensity(value, maxValue)}
                          ${getTextColor(value, maxValue)}
                          ${isCorrect ? 'border-green-400' : 'border-transparent'}
                        `}
                      >
                        <div className="text-lg font-bold">{value}</div>
                        {isCorrect && (
                          <div className="text-xs text-green-600 font-medium">
                            ✓ Correct
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p className="mb-2">
            <strong>How to read:</strong> Each cell shows the number of matches where the model predicted 
            the row outcome and the actual result was the column outcome.
          </p>
          <p>
            <strong>Perfect predictions:</strong> All values would be on the diagonal (green borders).
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
