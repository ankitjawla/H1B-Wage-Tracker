import csvData from '../assets/ryder_cup_analysis.csv?raw';

export function parseCSVData() {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  
  const data = lines.slice(1).map(line => {
    const values = line.split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    return row;
  });

  return data.map(row => ({
    round: parseInt(row.Round),
    matchId: row['Match ID'],
    usWinProb: parseFloat(row['US Match Win']),
    euWinProb: parseFloat(row['EU Match Win']),
    drawProb: parseFloat(row['Match Draw']),
    matchStanding: row['Match Standing'],
    actualOutcome: row['Match Outcome'],
    predictedOutcome: row['Predicted Outcome'],
    isCorrect: row['Is Correct'] === 'True'
  }));
}

export function calculateAccuracyMetrics(data) {
  const totalMatches = data.length;
  const correctPredictions = data.filter(match => match.isCorrect).length;
  const overallAccuracy = (correctPredictions / totalMatches) * 100;

  // Accuracy by outcome type
  const outcomeTypes = ['uswin', 'euwin', 'draw'];
  const accuracyByOutcome = {};

  outcomeTypes.forEach(outcome => {
    const matchesOfType = data.filter(match => 
      match.actualOutcome.toLowerCase().replace(' ', '') === outcome
    );
    const correctOfType = matchesOfType.filter(match => match.isCorrect);
    accuracyByOutcome[outcome] = {
      total: matchesOfType.length,
      correct: correctOfType.length,
      accuracy: matchesOfType.length > 0 ? (correctOfType.length / matchesOfType.length) * 100 : 0
    };
  });

  // Accuracy by round
  const rounds = [...new Set(data.map(match => match.round))].sort();
  const accuracyByRound = {};

  rounds.forEach(round => {
    const matchesInRound = data.filter(match => match.round === round);
    const correctInRound = matchesInRound.filter(match => match.isCorrect);
    accuracyByRound[round] = {
      total: matchesInRound.length,
      correct: correctInRound.length,
      accuracy: matchesInRound.length > 0 ? (correctInRound.length / matchesInRound.length) * 100 : 0
    };
  });

  return {
    totalMatches,
    correctPredictions,
    overallAccuracy,
    accuracyByOutcome,
    accuracyByRound
  };
}

export function getConfusionMatrix(data) {
  const outcomes = ['uswin', 'euwin', 'draw'];
  const matrix = {};

  outcomes.forEach(predicted => {
    matrix[predicted] = {};
    outcomes.forEach(actual => {
      matrix[predicted][actual] = 0;
    });
  });

  data.forEach(match => {
    const predicted = match.predictedOutcome.toLowerCase().replace(' ', '');
    const actual = match.actualOutcome.toLowerCase().replace(' ', '');
    if (matrix[predicted] && matrix[predicted][actual] !== undefined) {
      matrix[predicted][actual]++;
    }
  });

  return matrix;
}

export function getPredictionConfidenceData(data) {
  return data.map(match => {
    const maxProb = Math.max(match.usWinProb, match.euWinProb, match.drawProb);
    return {
      ...match,
      confidence: maxProb,
      confidenceLevel: maxProb > 0.6 ? 'High' : maxProb > 0.4 ? 'Medium' : 'Low'
    };
  });
}
