import { useState, useMemo, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Search, ArrowUpDown } from 'lucide-react';

export const MatchTable = memo(function MatchTable({ data }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('round');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const sortedData = useMemo(() => {
    let filtered = data.filter(match => {
      // Apply filter
      if (filter === 'correct' && !match.isCorrect) return false;
      if (filter === 'incorrect' && match.isCorrect) return false;
      
      // Apply search
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          match.matchId.toLowerCase().includes(search) ||
          match.round.toString().includes(search) ||
          match.predictedOutcome.toLowerCase().includes(search) ||
          match.actualOutcome.toLowerCase().includes(search)
        );
      }
      
      return true;
    });

    // Sort data
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'round') {
        comparison = a.round - b.round;
      } else if (sortBy === 'confidence') {
        const aConf = Math.max(a.usWinProb, a.euWinProb, a.drawProb);
        const bConf = Math.max(b.usWinProb, b.euWinProb, b.drawProb);
        comparison = bConf - aConf;
      } else if (sortBy === 'accuracy') {
        comparison = (b.isCorrect ? 1 : 0) - (a.isCorrect ? 1 : 0);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, filter, searchTerm, sortBy, sortOrder]);

  const getOutcomeBadge = (outcome, isCorrect) => {
    const baseClasses = "text-xs font-medium";
    if (outcome.toLowerCase().includes('us')) {
      return `${baseClasses} bg-blue-100 text-blue-800`;
    }
    if (outcome.toLowerCase().includes('eu')) {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  const formatProbability = (prob) => {
    return (prob * 100).toFixed(1) + '%';
  };

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle>Match-by-Match Analysis</CardTitle>
              <CardDescription>
                Detailed comparison of predictions vs actual results
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({data.length})
              </Button>
              <Button
                variant={filter === 'correct' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('correct')}
              >
                ✓ Correct ({data.filter(m => m.isCorrect).length})
              </Button>
              <Button
                variant={filter === 'incorrect' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('incorrect')}
              >
                ✗ Incorrect ({data.filter(m => !m.isCorrect).length})
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by Match ID, Round, or Outcome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7"
                onClick={() => setSearchTerm('')}
              >
                Clear
              </Button>
            )}
          </div>
          
          {/* Results count */}
          <div className="text-sm text-gray-600">
            Showing {sortedData.length} of {data.length} matches
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th 
                  className="text-left p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('round')}
                >
                  <div className="flex items-center gap-1">
                    Round
                    {sortBy === 'round' && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th className="text-left p-3">Match ID</th>
                <th className="text-left p-3">US Win</th>
                <th className="text-left p-3">EU Win</th>
                <th className="text-left p-3">Draw</th>
                <th className="text-left p-3">Predicted</th>
                <th className="text-left p-3">Actual</th>
                <th 
                  className="text-left p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort('accuracy')}
                >
                  <div className="flex items-center gap-1">
                    Result
                    {sortBy === 'accuracy' && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    No matches found. Try adjusting your filters or search term.
                  </td>
                </tr>
              ) : (
                sortedData.map((match, index) => (
                  <tr 
                    key={`${match.round}-${match.matchId}`}
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      !match.isCorrect ? 'bg-red-50/50' : ''
                    }`}
                  >
                    <td className="p-3 font-medium">{match.round}</td>
                    <td className="p-3 font-mono text-sm">{match.matchId}</td>
                    <td className="p-3">
                      <span className="font-mono text-blue-600 font-semibold">
                        {formatProbability(match.usWinProb)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-red-600 font-semibold">
                        {formatProbability(match.euWinProb)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-gray-600 font-semibold">
                        {formatProbability(match.drawProb)}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge className={getOutcomeBadge(match.predictedOutcome)}>
                        {match.predictedOutcome}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={getOutcomeBadge(match.actualOutcome)}>
                        {match.actualOutcome}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {match.isCorrect ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">Correct</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="text-xs text-red-600 font-medium">Wrong</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});
