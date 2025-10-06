import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, TrendingDown, AlertTriangle, Target } from 'lucide-react';

export const InsightsPanel = memo(function InsightsPanel({ data, metrics }) {
  const { overallAccuracy, accuracyByOutcome, accuracyByRound } = metrics;

  // Analyze patterns in misclassifications
  const misclassifications = data.filter(match => !match.isCorrect);
  
  // Find rounds with worst performance
  const worstRounds = Object.entries(accuracyByRound)
    .sort(([,a], [,b]) => a.accuracy - b.accuracy)
    .slice(0, 2);

  // Analyze confidence vs accuracy
  const lowConfidenceCorrect = data.filter(match => {
    const maxProb = Math.max(match.usWinProb, match.euWinProb, match.drawProb);
    return maxProb <= 0.5 && match.isCorrect;
  });

  const highConfidenceIncorrect = data.filter(match => {
    const maxProb = Math.max(match.usWinProb, match.euWinProb, match.drawProb);
    return maxProb > 0.6 && !match.isCorrect;
  });

  // Draw prediction analysis
  const drawPredictions = data.filter(match => 
    match.predictedOutcome.toLowerCase().includes('draw')
  );
  const actualDraws = data.filter(match => 
    match.actualOutcome.toLowerCase().includes('draw')
  );

  const recommendations = [
    {
      type: 'critical',
      icon: <AlertTriangle className="h-5 w-5" />,
      title: 'Draw Prediction Challenge',
      description: `The model failed to correctly predict any draws (0% accuracy). With ${actualDraws.length} actual draws in the tournament, this represents a significant blind spot.`,
      suggestions: [
        'Incorporate more features that indicate close matches (e.g., historical head-to-head records)',
        'Adjust probability thresholds for draw predictions',
        'Consider ensemble methods that better capture uncertainty'
      ]
    },
    {
      type: 'warning',
      icon: <TrendingDown className="h-5 w-5" />,
      title: 'Overall Accuracy Concerns',
      description: `At ${overallAccuracy.toFixed(1)}%, the model performs below random chance for a 3-outcome prediction (33.3%).`,
      suggestions: [
        'Review feature engineering - current features may not be predictive',
        'Collect additional data sources (weather, course conditions, recent form)',
        'Consider different modeling approaches (ensemble methods, neural networks)'
      ]
    }
  ];

  if (worstRounds.length > 0) {
    recommendations.push({
      type: 'improvement',
      icon: <Target className="h-5 w-5" />,
      title: 'Round-Specific Issues',
      description: `Rounds ${worstRounds.map(([round]) => round).join(' and ')} showed particularly poor performance.`,
      suggestions: [
        'Analyze what makes these rounds different (format, pressure, course setup)',
        'Develop round-specific models or features',
        'Consider the psychological factors in different tournament stages'
      ]
    });
  }

  if (highConfidenceIncorrect.length > 0) {
    recommendations.push({
      type: 'insight',
      icon: <Lightbulb className="h-5 w-5" />,
      title: 'Overconfident Predictions',
      description: `${highConfidenceIncorrect.length} high-confidence predictions were incorrect, suggesting model calibration issues.`,
      suggestions: [
        'Implement probability calibration techniques',
        'Use cross-validation to better estimate prediction uncertainty',
        'Consider Bayesian approaches for better uncertainty quantification'
      ]
    });
  }

  const getAlertVariant = (type) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      default: return 'default';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'improvement': return 'text-blue-600';
      default: return 'text-green-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Model Performance Insights
          </CardTitle>
          <CardDescription>
            Key findings and recommendations for improving prediction accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600">Misclassifications</div>
              <div className="text-2xl font-bold text-red-600">{misclassifications.length}</div>
              <div className="text-xs text-gray-500">out of {data.length} matches</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600">High Conf. Wrong</div>
              <div className="text-2xl font-bold text-orange-600">{highConfidenceIncorrect.length}</div>
              <div className="text-xs text-gray-500">overconfident errors</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600">Low Conf. Right</div>
              <div className="text-2xl font-bold text-green-600">{lowConfidenceCorrect.length}</div>
              <div className="text-xs text-gray-500">underconfident correct</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600">Draw Accuracy</div>
              <div className="text-2xl font-bold text-red-600">{accuracyByOutcome.draw.accuracy.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">{actualDraws.length} actual draws</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recommendations for Model Improvement</h3>
        
        {recommendations.map((rec, index) => (
          <Alert key={index} variant={getAlertVariant(rec.type)} className="p-4">
            <div className={`${getIconColor(rec.type)}`}>
              {rec.icon}
            </div>
            <div className="ml-2">
              <h4 className="font-semibold mb-2">{rec.title}</h4>
              <AlertDescription className="mb-3">
                {rec.description}
              </AlertDescription>
              <div className="space-y-1">
                <div className="text-sm font-medium">Suggested Actions:</div>
                <ul className="text-sm space-y-1 ml-4">
                  {rec.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="list-disc">{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Alert>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">1</Badge>
              <div>
                <div className="font-medium">Data Collection</div>
                <div className="text-sm text-gray-600">
                  Gather additional features like weather conditions, recent player form, and course-specific statistics.
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">2</Badge>
              <div>
                <div className="font-medium">Feature Engineering</div>
                <div className="text-sm text-gray-600">
                  Create new features that better capture match dynamics and player interactions.
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">3</Badge>
              <div>
                <div className="font-medium">Model Architecture</div>
                <div className="text-sm text-gray-600">
                  Experiment with ensemble methods, neural networks, or specialized sports prediction models.
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">4</Badge>
              <div>
                <div className="font-medium">Validation Strategy</div>
                <div className="text-sm text-gray-600">
                  Implement proper cross-validation and calibration techniques to improve reliability.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
