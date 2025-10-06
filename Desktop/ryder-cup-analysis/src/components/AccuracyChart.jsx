import { memo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Line, ComposedChart, ReferenceLine, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const AccuracyChart = memo(function AccuracyChart({ accuracyByRound }) {
  const [showTrend, setShowTrend] = useState(true);
  
  const chartData = Object.entries(accuracyByRound).map(([round, data]) => ({
    round: `Round ${round}`,
    roundNum: parseInt(round),
    accuracy: data.accuracy,
    correct: data.correct,
    total: data.total
  }));

  // Calculate average accuracy
  const avgAccuracy = chartData.reduce((sum, d) => sum + d.accuracy, 0) / chartData.length;
  
  // Calculate trend (simple linear regression)
  const calculateTrend = () => {
    const n = chartData.length;
    const sumX = chartData.reduce((sum, d) => sum + d.roundNum, 0);
    const sumY = chartData.reduce((sum, d) => sum + d.accuracy, 0);
    const sumXY = chartData.reduce((sum, d) => sum + d.roundNum * d.accuracy, 0);
    const sumX2 = chartData.reduce((sum, d) => sum + d.roundNum * d.roundNum, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  };

  const { slope, intercept } = calculateTrend();
  const trendDirection = slope > 0 ? 'improving' : slope < 0 ? 'declining' : 'stable';

  const getBarColor = (accuracy) => {
    if (accuracy >= 70) return '#10b981'; // green
    if (accuracy >= 50) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Accuracy: {data.accuracy.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Correct: {data.correct}/{data.total} matches
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {data.accuracy >= avgAccuracy ? '↑ Above' : '↓ Below'} average ({avgAccuracy.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Accuracy by Round</CardTitle>
            <CardDescription>
              Model performance across different tournament rounds
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={trendDirection === 'improving' ? 'default' : 'destructive'} className="flex items-center gap-1">
              {trendDirection === 'improving' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              Trend: {trendDirection}
            </Badge>
            <button
              onClick={() => setShowTrend(!showTrend)}
              className="text-xs text-blue-600 hover:underline"
            >
              {showTrend ? 'Hide' : 'Show'} Trend
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="round" 
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 100]}
                className="text-sm"
                tick={{ fontSize: 12 }}
                label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Reference line for average */}
              <ReferenceLine 
                y={avgAccuracy} 
                stroke="#6b7280" 
                strokeDasharray="5 5"
                label={{ value: 'Average', position: 'right', fill: '#6b7280', fontSize: 11 }}
              />
              
              {/* Reference line for random chance */}
              <ReferenceLine 
                y={33.3} 
                stroke="#ef4444" 
                strokeDasharray="3 3"
                label={{ value: 'Random (33.3%)', position: 'right', fill: '#ef4444', fontSize: 11 }}
              />
              
              <Bar dataKey="accuracy" radius={[4, 4, 0, 0]} name="Accuracy" animationDuration={800}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.accuracy)} />
                ))}
              </Bar>
              
              {/* Trend line */}
              {showTrend && (
                <Line 
                  type="monotone"
                  dataKey={(data) => slope * data.roundNum + intercept}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Trend"
                  strokeDasharray="5 5"
                  animationDuration={1000}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Good (≥70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Fair (50-69%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Poor (&lt;50%)</span>
            </div>
          </div>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Average Accuracy: <span className="font-semibold">{avgAccuracy.toFixed(1)}%</span></p>
            <p className="text-xs mt-1">
              Performance trend: <span className={slope > 0 ? 'text-green-600' : 'text-red-600'}>
                {slope > 0 ? '+' : ''}{(slope * chartData.length).toFixed(1)}% {trendDirection}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
