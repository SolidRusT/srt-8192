import React, { useEffect, useState } from 'react';
import { PlayerState } from '../../../backend/persistence/StateManager';
import './ProgressPanel.css';

interface ProgressPanelProps {
  getPlayerState: (playerId: string) => Promise<PlayerState>;
  currentPlayerId: string;
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({ getPlayerState, currentPlayerId }) => {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPlayerState = async () => {
      setLoading(true);
      try {
        const data = await getPlayerState(currentPlayerId);
        setPlayerState(data);
      } catch (error) {
        console.error('Error fetching player state:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayerState();
  }, [getPlayerState, currentPlayerId]);

  if (loading) {
    return <div className="progress-panel-container">Loading player progress...</div>;
  }

  if (!playerState) {
    return <div className="progress-panel-container">No player progress found.</div>;
  }

  return (
    <div className="progress-panel-container">
      <h2>Player Progress</h2>
      <div className="progress-details">
        <p><strong>Player ID:</strong> {playerState.id}</p>
        <p><strong>Resources:</strong></p>
        <ul>
          {Object.entries(playerState.resources).map(([resource, amount]) => (
            <li key={resource}>{resource}: {amount}</li>
          ))}
        </ul>
        <p><strong>Controlled Regions:</strong> {playerState.regions.join(', ')}</p>
      </div>
    </div>
  );
};

export default ProgressPanel;

// ProgressPanel.css
/*
.progress-panel-container {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  max-width: 400px;
  margin: 0 auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.progress-details {
  margin-top: 10px;
}

.progress-details p {
  margin: 10px 0;
}

.progress-details ul {
  list-style-type: none;
  padding-left: 0;
}

.progress-details li {
  margin: 5px 0;
}
*/
