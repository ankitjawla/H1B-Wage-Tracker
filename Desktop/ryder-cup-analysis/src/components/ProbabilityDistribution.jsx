import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export const ProbabilityDistribution = memo(function ProbabilityDistribution({ data }) {
  // Prepare data for scatter plot
  const scatterData = data.map((match, index) => {
    const maxProb = Math.max(match.usWinProb, match.euWinProb, match.drawProb);
    return {
      index: index + 1,
      confidence: maxProb,
      isCorrect: match.isCorrect,
      round: match.round,
      matchId: match.matchId,
      predicted: match.predictedOutcome,
      actual: match.actualOutcome
    };
  });

  // Separate correct and incorrect predictions
  const correctPredictions = scatterData.filter(d => d.isCorrect);
  const incorrectPredictions = scatterData.filter(d => !d.isCorrect);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">Round {data.round} - Match {data.matchId}</p>
          <p className="text-sm text-gray-600">
            Confidence: {(data.confidence * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            Predicted: {data.predicted}
          </p>
          <p className="text-sm text-gray-600">
            Actual: {data.actual}
          </p>
          <p className={`text-sm font-medium ${data.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {data.isCorrect ? '✓ Correct' : '✗ Incorrect'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate confidence level statistics
  const confidenceStats = {
    high: scatterData.filter(d => d.confidence > 0.6),
    medium: scatterData.filter(d => d.confidence > 0.4 && d.confidence <= 0.6),
    low: scatterData.filter(d => d.confidence <= 0.4)
  };

  const getAccuracyForConfidenceLevel = (level) => {
    const correct = level.filter(d => d.isCorrect).length;
    return level.length > 0 ? (correct / level.length) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Prediction Confidence Distribution</CardTitle>
          <CardDescription>
            Relationship between prediction confidence and accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                
                {/* Reference lines for confidence thresholds */}
                <ReferenceLine 
                  y={0.6} 
                  stroke="#10b981" 
                  strokeDasharray="5 5"
                  label={{ value: 'High Confidence (60%)', position: 'right', fill: '#10b981', fontSize: 10 }}
                />
                <ReferenceLine 
                  y={0.4} 
                  stroke="#f59e0b" 
                  strokeDasharray="5 5"
                  label={{ value: 'Medium (40%)', position: 'right', fill: '#f59e0b', fontSize: 10 }}
                />
                <ReferenceLine 
                  y={0.333} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3"
                  label={{ value: 'Random Baseline (33%)', position: 'right', fill: '#ef4444', fontSize: 10 }}
                />
                
                <XAxis 
                  type="number"
                  dataKey="index"
                  domain={[0, data.length + 1]}
                  name="Match Number"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Match Number', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number"
                  dataKey="confidence"
                  domain={[0, 1]}
                  name="Confidence"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  label={{ value: 'Prediction Confidence', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Correct predictions */}
                <Scatter 
                  name="Correct Predictions" 
                  data={correctPredictions} 
                  fill="#10b981"
                  opacity={0.8}
                />
                
                {/* Incorrect predictions */}
                <Scatter 
                  name="Incorrect Predictions" 
                  data={incorrectPredictions} 
                  fill="#ef4444"
                  opacity={0.8}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Correct Predictions ({correctPredictions.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Incorrect Predictions ({incorrectPredictions.length})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Confidence Level Analysis</CardTitle>
          <CardDescription>
            Accuracy breakdown by prediction confidence levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-semibold text-green-600">High Confidence</div>
              <div className="text-sm text-gray-600 mb-2">&gt; 60% probability</div>
              <div className="text-2xl font-bold">
                {getAccuracyForConfidenceLevel(confidenceStats.high).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">
                {confidenceStats.high.filter(d => d.isCorrect).length} of {confidenceStats.high.length} correct
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-semibold text-yellow-600">Medium Confidence</div>
              <div className="text-sm text-gray-600 mb-2">40-60% probability</div>
              <div className="text-2xl font-bold">
                {getAccuracyForConfidenceLevel(confidenceStats.medium).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">
                {confidenceStats.medium.filter(d => d.isCorrect).length} of {confidenceStats.medium.length} correct
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-semibold text-red-600">Low Confidence</div>
              <div className="text-sm text-gray-600 mb-2">≤ 40% probability</div>
              <div className="text-2xl font-bold">
                {getAccuracyForConfidenceLevel(confidenceStats.low).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">
                {confidenceStats.low.filter(d => d.isCorrect).length} of {confidenceStats.low.length} correct
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
