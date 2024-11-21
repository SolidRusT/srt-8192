import React from 'react';

interface PlayerScore {
  playerId: string;
  totalScore: number;
  resourcePoints: number;
  combatPoints: number;
  achievementPoints: number;
}

interface ScoreBoardProps {
  scores: PlayerScore[];
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ scores }) => {
  return (
    <div className="scoreboard">
      <h2>Scoreboard</h2>
      <table>
        <thead>
          <tr>
            <th>Player ID</th>
            <th>Total Score</th>
            <th>Resource Points</th>
            <th>Combat Points</th>
            <th>Achievement Points</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score) => (
            <tr key={score.playerId}>
              <td>{score.playerId}</td>
              <td>{score.totalScore}</td>
              <td>{score.resourcePoints}</td>
              <td>{score.combatPoints}</td>
              <td>{score.achievementPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScoreBoard;

// Example usage
const exampleScores: PlayerScore[] = [
  { playerId: 'player1', totalScore: 150, resourcePoints: 100, combatPoints: 30, achievementPoints: 20 },
  { playerId: 'player2', totalScore: 200, resourcePoints: 120, combatPoints: 50, achievementPoints: 30 },
];

// In a parent component, you could use:
// <ScoreBoard scores={exampleScores} />
