import React from 'react';
import './TutorialOverlay.css';

interface TutorialOverlayProps {
  currentStepDescription: string;
  onNextStep: () => void;
  isLastStep: boolean;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ currentStepDescription, onNextStep, isLastStep }) => {
  return (
    <div className="tutorial-overlay">
      <div className="overlay-content">
        <p>{currentStepDescription}</p>
        <button onClick={onNextStep} className="next-step-button">
          {isLastStep ? 'Finish Tutorial' : 'Next Step'}
        </button>
      </div>
    </div>
  );
};

export default TutorialOverlay;

// Example CSS (TutorialOverlay.css)
/*
.tutorial-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.overlay-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.next-step-button {
  margin-top: 20px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.next-step-button:hover {
  background: #0056b3;
}
*/
