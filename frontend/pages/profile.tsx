import React from 'react';
import './Profile.css';
import { Notification } from '../../../backend/services/notifications/NotificationService';

interface ProfileProps {
  playerId: string;
  playerStats: {
    gamesPlayed: number;
    gamesWon: number;
    achievements: string[];
    resourcesCollected: number;
  };
  notifications: Notification[];
}

/**
 * Component to display the player's profile, tracking stats, achievements, and progress over multiple sessions.
 */
const Profile: React.FC<ProfileProps> = ({ playerId, playerStats, notifications }) => {
  const { gamesPlayed, gamesWon, achievements, resourcesCollected } = playerStats;
  const playerNotifications = notifications.filter((notification) => notification.playerId === playerId);

  return (
    <div className="profile-page">
      <h2>Player Profile</h2>
      <div className="profile-stats">
        <p><strong>Games Played:</strong> {gamesPlayed}</p>
        <p><strong>Games Won:</strong> {gamesWon}</p>
        <p><strong>Resources Collected:</strong> {resourcesCollected}</p>
        <h3>Achievements</h3>
        <ul>
          {achievements.length === 0 && <li>No achievements yet.</li>}
          {achievements.map((achievement, index) => (
            <li key={index}>{achievement}</li>
          ))}
        </ul>
      </div>
      <div className="profile-notifications">
        <h3>Recent Notifications</h3>
        <ul>
          {playerNotifications.length === 0 && <li>No recent notifications.</li>}
          {playerNotifications.map((notification, index) => (
            <li key={index} className={`notification-item ${notification.type.toLowerCase()}`}>
              <span className="notification-type">[{notification.type}]</span> - {notification.message}
              <span className="notification-timestamp">{notification.timestamp.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
