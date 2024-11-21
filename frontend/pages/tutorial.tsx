import React, { useEffect, useState } from 'react';
import { TutorialService, TutorialStep } from '../../backend/services/tutorial/TutorialService';
import TutorialManager from '../../backend/game-logic/TutorialManager';

const tutorialService = new TutorialService();
const tutorialManager = new TutorialManager(tutorialService);

const TutorialPage: React.FC = () => {
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>([]);
  const playerId = 'player1'; // Placeholder for the current player's ID

  useEffect(() => {
    // Initialize the tutorial for the player
    tutorialManager.startTutorial(playerId);
    const steps = tutorialManager.getTutorialSteps(playerId);
    if (steps) {
      setTutorialSteps(steps);
    }
  }, [playerId]);

  const handleCompleteStep = (stepId: string) => {
    tutorialManager.progressTutorial(playerId, stepId);
    const updatedSteps = tutorialManager.getTutorialSteps(playerId);
    if (updatedSteps) {
      setTutorialSteps(updatedSteps);
    }
  };

  return (
    <div className="tutorial-page">
      <h1>Tutorial</h1>
      <ul>
        {tutorialSteps.map((step) => (
          <li key={step.stepId} className={step.isCompleted ? 'completed' : ''}>
            <span>{step.description}</span>
            {!step.isCompleted && (
              <button onClick={() => handleCompleteStep(step.stepId)}>Complete Step</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TutorialPage;

// Example usage in a parent component or in your routing setup
// <TutorialPage />
