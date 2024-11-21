import React, { useEffect, useState } from 'react';
import { ChatMessage } from '../../../backend/services/social/ChatService';
import './ChatWindow.css';

interface ChatWindowProps {
  sendMessage: (senderId: string, message: string) => void;
  getRecentMessages: () => Promise<ChatMessage[]>;
  currentPlayerId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ sendMessage, getRecentMessages, currentPlayerId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getRecentMessages();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching chat messages:', error);
      }
    };
    fetchMessages();
  }, [getRecentMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    sendMessage(currentPlayerId, newMessage);
    setMessages(prevMessages => [
      ...prevMessages,
      { senderId: currentPlayerId, message: newMessage, timestamp: new Date() },
    ]);
    setNewMessage('');
  };

  return (
    <div className="chat-window-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.senderId === currentPlayerId ? 'own-message' : ''}`}>
            <span className="message-sender">{msg.senderId}</span>: <span className="message-text">{msg.message}</span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;

// ChatWindow.css
/*
.chat-window-container {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  max-width: 400px;
  margin: 0 auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chat-messages {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
}

.chat-message {
  margin-bottom: 8px;
}

.own-message {
  text-align: right;
  font-weight: bold;
}

.message-sender {
  font-weight: bold;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.chat-input button {
  padding: 8px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
*/
