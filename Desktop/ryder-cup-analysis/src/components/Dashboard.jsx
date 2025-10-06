import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';

export const Dashboard = memo(function Dashboard({ metrics }) {
  const { overallAccuracy, totalMatches, correctPredictions, accuracyByOutcome } = metrics;
  
  // Calculate baseline comparison (random chance for 3-way prediction)
  const randomChance = 33.3;
  const improvement = overallAccuracy - randomChance;
  const performanceVsBaseline = improvement >= 0 ? 'above' : 'below';

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 70) return 'text-green-600';
    if (accuracy >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBadge = (accuracy) => {
    if (accuracy >= 70) return 'bg-green-100 text-green-800';
    if (accuracy >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Performance Alert Banner */}
      <Card className={`border-l-4 ${improvement < 0 ? 'border-l-red-500 bg-red-50/50' : 'border-l-green-500 bg-green-50/50'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {improvement < 0 ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Model Performance vs Random Baseline
              </p>
              <p className="text-sm text-gray-600">
                Current accuracy is <span className="font-bold">{Math.abs(improvement).toFixed(1)}%</span> {performanceVsBaseline} random chance ({randomChance}%)
                {improvement < 0 && ' - Model needs significant improvement'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAccuracyColor(overallAccuracy)}`}>
              {overallAccuracy.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {correctPredictions} of {totalMatches} matches
            </p>
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-gray-500">
                Error Rate: {(100 - overallAccuracy).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">US Win Predictions</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getAccuracyColor(accuracyByOutcome.uswin.accuracy)}`}>
            {accuracyByOutcome.uswin.accuracy.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {accuracyByOutcome.uswin.correct} of {accuracyByOutcome.uswin.total} matches
          </p>
          <Badge className={`mt-2 ${getAccuracyBadge(accuracyByOutcome.uswin.accuracy)}`}>
            US Team
          </Badge>
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-gray-500">
              Precision: {accuracyByOutcome.uswin.total > 0 ? ((accuracyByOutcome.uswin.correct / accuracyByOutcome.uswin.total) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">EU Win Predictions</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getAccuracyColor(accuracyByOutcome.euwin.accuracy)}`}>
            {accuracyByOutcome.euwin.accuracy.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {accuracyByOutcome.euwin.correct} of {accuracyByOutcome.euwin.total} matches
          </p>
          <Badge className={`mt-2 ${getAccuracyBadge(accuracyByOutcome.euwin.accuracy)}`}>
            EU Team
          </Badge>
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-gray-500">
              Precision: {accuracyByOutcome.euwin.total > 0 ? ((accuracyByOutcome.euwin.correct / accuracyByOutcome.euwin.total) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Draw Predictions</CardTitle>
          <BarChart3 className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getAccuracyColor(accuracyByOutcome.draw.accuracy)}`}>
            {accuracyByOutcome.draw.accuracy.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {accuracyByOutcome.draw.correct} of {accuracyByOutcome.draw.total} matches
          </p>
          <Badge className={`mt-2 ${getAccuracyBadge(accuracyByOutcome.draw.accuracy)}`}>
            Draw
          </Badge>
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-red-600 font-medium">
              ⚠ Critical Gap
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
});
