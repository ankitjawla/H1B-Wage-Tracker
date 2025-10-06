import { useState, useEffect, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, BarChart3, Table as TableIcon, Target, Lightbulb, FileText, TrendingUp } from 'lucide-react';

import { Dashboard } from './components/Dashboard';
import { MatchTable } from './components/MatchTable';
import { AccuracyChart } from './components/AccuracyChart';
import { ConfusionMatrix } from './components/ConfusionMatrix';
import { ProbabilityDistribution } from './components/ProbabilityDistribution';
import { InsightsPanel } from './components/InsightsPanel';

import { parseCSVData, calculateAccuracyMetrics, getConfusionMatrix } from './lib/data';
import './App.css';

// Loading component for suspense
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const parsedData = parseCSVData();
      const calculatedMetrics = calculateAccuracyMetrics(parsedData);
      const matrix = getConfusionMatrix(parsedData);
      
      setData(parsedData);
      setMetrics(calculatedMetrics);
      setConfusionMatrix(matrix);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  }, []);

  const exportData = (format = 'csv') => {
    if (format === 'csv') {
      const csvContent = [
        ['Round', 'Match ID', 'US Win Prob', 'EU Win Prob', 'Draw Prob', 'Predicted', 'Actual', 'Correct'].join(','),
        ...data.map(match => [
          match.round,
          match.matchId,
          (match.usWinProb * 100).toFixed(1) + '%',
          (match.euWinProb * 100).toFixed(1) + '%',
          (match.drawProb * 100).toFixed(1) + '%',
          match.predictedOutcome,
          match.actualOutcome,
          match.isCorrect ? 'Yes' : 'No'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ryder_cup_analysis_results.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const jsonData = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalMatches: data.length,
          metrics: metrics
        },
        matches: data,
        confusionMatrix: confusionMatrix
      };
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ryder_cup_analysis_complete.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'summary') {
      const summary = `RYDER CUP 2025 - ML PREDICTION ANALYSIS SUMMARY
Generated: ${new Date().toLocaleString()}

OVERALL PERFORMANCE
===================
Total Matches: ${metrics.totalMatches}
Correct Predictions: ${metrics.correctPredictions}
Overall Accuracy: ${metrics.overallAccuracy.toFixed(2)}%
Random Baseline: 33.33%
Performance vs Baseline: ${(metrics.overallAccuracy - 33.33).toFixed(2)}%

ACCURACY BY OUTCOME
==================
US Win: ${metrics.accuracyByOutcome.uswin.accuracy.toFixed(2)}% (${metrics.accuracyByOutcome.uswin.correct}/${metrics.accuracyByOutcome.uswin.total})
EU Win: ${metrics.accuracyByOutcome.euwin.accuracy.toFixed(2)}% (${metrics.accuracyByOutcome.euwin.correct}/${metrics.accuracyByOutcome.euwin.total})
Draw: ${metrics.accuracyByOutcome.draw.accuracy.toFixed(2)}% (${metrics.accuracyByOutcome.draw.correct}/${metrics.accuracyByOutcome.draw.total})

ACCURACY BY ROUND
=================
${Object.entries(metrics.accuracyByRound).map(([round, data]) => 
  `Round ${round}: ${data.accuracy.toFixed(2)}% (${data.correct}/${data.total})`
).join('\n')}

KEY FINDINGS
===========
${metrics.overallAccuracy < 33.33 ? '⚠ Model performs below random chance' : '✓ Model performs above random chance'}
${metrics.accuracyByOutcome.draw.accuracy === 0 ? '⚠ Critical: 0% accuracy on draw predictions' : ''}
`;
      
      const blob = new Blob([summary], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ryder_cup_analysis_summary.txt';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Ryder Cup analysis...</p>
        </div>
      </div>
    );
  }

  if (!data.length || !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error loading data. Please check the CSV file.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ryder Cup 2025 - ML Prediction Analysis
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Comparing machine learning predictions vs actual tournament results
              </p>
              {metrics && (
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {metrics.totalMatches} Matches
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {metrics.correctPredictions} Correct
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    metrics.overallAccuracy >= 50 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {metrics.overallAccuracy.toFixed(1)}% Accuracy
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => exportData('csv')} 
                className="flex items-center gap-2"
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button 
                onClick={() => exportData('json')} 
                className="flex items-center gap-2"
                variant="outline"
                size="sm"
              >
                <FileText className="h-4 w-4" />
                JSON
              </Button>
              <Button 
                onClick={() => exportData('summary')} 
                className="flex items-center gap-2"
                size="sm"
              >
                <Download className="h-4 w-4" />
                Summary Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <Dashboard metrics={metrics} />

        {/* Tabbed Content */}
        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white shadow-sm">
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Matches</span>
              <span className="sm:hidden">Data</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Charts</span>
              <span className="sm:hidden">Chart</span>
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Matrix</span>
            </TabsTrigger>
            <TabsTrigger value="confidence" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Confidence</span>
              <span className="sm:hidden">Conf</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-6 animate-in fade-in-0 duration-300">
            <Suspense fallback={<LoadingSpinner />}>
              <MatchTable data={data} />
            </Suspense>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6 animate-in fade-in-0 duration-300">
            <Suspense fallback={<LoadingSpinner />}>
              <AccuracyChart accuracyByRound={metrics.accuracyByRound} />
            </Suspense>
          </TabsContent>

          <TabsContent value="matrix" className="space-y-6 animate-in fade-in-0 duration-300">
            <Suspense fallback={<LoadingSpinner />}>
              <ConfusionMatrix confusionMatrix={confusionMatrix} />
            </Suspense>
          </TabsContent>

          <TabsContent value="confidence" className="space-y-6 animate-in fade-in-0 duration-300">
            <Suspense fallback={<LoadingSpinner />}>
              <ProbabilityDistribution data={data} />
            </Suspense>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 animate-in fade-in-0 duration-300">
            <Suspense fallback={<LoadingSpinner />}>
              <InsightsPanel data={data} metrics={metrics} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p>Ryder Cup 2025 Machine Learning Prediction Analysis</p>
            <p className="text-sm mt-1">
              Built with React, Tailwind CSS, and Recharts
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
