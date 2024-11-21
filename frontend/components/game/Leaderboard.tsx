import React, { useEffect, useState } from 'react';
import { PlayerStats } from '../../../backend/services/leaderboard/LeaderboardService';
import './Leaderboard.css';

interface LeaderboardProps {
  getLeaderboardData: () => Promise<PlayerStats[]>;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ getLeaderboardData }) => {
  const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await getLeaderboardData();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [getLeaderboardData]);

  return (
    <div className="leaderboard-container">
      <h2>Leaderboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
              <th>Achievements</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player, index) => (
              <tr key={player.id}>
                <td>{index + 1}</td>
                <td>{player.id}</td>
                <td>{player.score}</td>
                <td>{player.achievements.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;

// Leaderboard.css
/*
.leaderboard-container {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
}

.leaderboard-table th, .leaderboard-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.leaderboard-table th {
  background-color: #4CAF50;
  color: white;
}
*/
