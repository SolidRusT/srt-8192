import React from 'react';
import { Notification, NotificationType } from '../../../backend/services/notifications/NotificationService';
import './ActionHistoryPanel.css';

interface ActionHistoryPanelProps {
  notifications: Notification[];
  playerId: string;
  aiNotifications: Notification[];
  maxActions: number;
}

/**
 * Component to display the action history of a player and the AI, including warnings, reminders, and achievements.
 */
const ActionHistoryPanel: React.FC<ActionHistoryPanelProps> = ({ notifications, playerId, aiNotifications, maxActions }) => {
  const playerNotifications = notifications.filter((notification) => notification.playerId === playerId);
  const allNotifications = [...playerNotifications, ...aiNotifications]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxActions);

  return (
    <div className="action-history-panel">
      <h3>Action History</h3>
      <ul>
        {allNotifications.length === 0 && <li>No recent actions or notifications.</li>}
        {allNotifications.map((notification, index) => (
          <li key={index} className={`notification-item ${notification.type.toLowerCase()}`}>
            <span className="notification-type">[{notification.type}]</span> - {notification.message}
            <span className="notification-timestamp">{notification.timestamp.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActionHistoryPanel;
