# Turn System Explanation

In this document, we explain the turn-based system utilized in the 8192 game. This turn-based mechanic is at the core of the game and governs how players interact, how the AI responds, and how the game progresses through each cycle. Understanding the turn system is key to developing features, ensuring smooth game flow, and creating engaging player experiences.

## Overview of Turn-Based Mechanics

The 8192 game is divided into discrete **turns**, which alternate between players and the AI. The turn system is designed to maintain fairness, provide players with a strategic edge, and give ample time for both human and AI players to perform their actions. Each turn consists of several **phases** where different types of actions are permitted.

### Turn Phases

Each turn is divided into the following phases:

1. **Preparation Phase**
   - **Purpose**: Players prepare their resources, deploy units, and make strategic decisions for the upcoming turn.
   - **Actions**: Allocate resources, adjust unit positions, and perform scouting operations.

2. **Action Phase**
   - **Purpose**: Players execute their main actions, including attacks, resource collection, and construction.
   - **Actions**: Launch military campaigns, initiate trade, expand into new regions, and construct buildings.

3. **AI Response Phase**
   - **Purpose**: The AI reacts to player actions, adapting its strategies based on the game state.
   - **Actions**: AI performs defensive maneuvers, offensive strikes, or economic expansions based on its strategy weights.

4. **Resolution Phase**
   - **Purpose**: The game resolves all actions performed during the turn, calculating outcomes and updating the game state.
   - **Actions**: Combat results are calculated, resources are gathered, and territories are updated.

### Turn Flow

- **Player Turn**: A human player takes control of each of the phases, deciding how to utilize available resources and units.
- **AI Turn**: After the player concludes their turn, the AI takes its turn, performing actions based on its predefined strategies and reacting to player moves.

### Timing and Turn Limitations

- **Turn Timer**: Each turn has a **maximum duration**, providing a limited window in which to complete actions. This ensures the game progresses smoothly and keeps players engaged.
  - Default Timer: Each turn lasts up to **73.828 seconds**, which aligns perfectly with the updated game cycle duration to ensure synchronization.

- **Game Cycle Timer**: The game progresses with **8,192 game cycles** spanning across **two weeks**. Each game cycle lasts **73.828 seconds**, allowing for perfect alignment with the two-week period without requiring downtime or leftover time. This ensures the game world resets exactly after two weeks, keeping all players on the same rhythm.

- **Max Turns Per Cycle**: A game cycle can contain a maximum number of turns, defined in the **game settings** (e.g., **100 turns** per cycle). Once the limit is reached, the game moves into a new cycle, where players may be rewarded for their progress.

### Syncing Player and AI Turns

To ensure fair play and balanced game flow, both player and AI turns are **synchronized** in the following manner:

- The AI waits for the player to complete their turn before starting its own, providing a clear sequence of actions.
- The game maintains a **turn log** that records all player and AI actions, which is essential for transparency and for replaying sequences for debugging purposes.
- Notifications are generated at the end of each turn to inform players of major events, such as victories, resource gains, or losses.

## Special Turn Actions

### 1. Fast Actions
- **Definition**: Certain actions, such as scouting or quick resource transactions, are considered **fast actions** and may be performed outside the normal phases.
- **Impact**: These actions are intended to add flexibility to player strategy without consuming a full turn, allowing players to respond dynamically to changing game conditions.

### 2. Combined Actions
- **Definition**: Players can queue up multiple actions that execute sequentially during the **Action Phase**.
- **Impact**: This feature enables more complex strategic planning, such as coordinating multiple unit movements with a construction project.

## Turn-Based System Challenges

### 1. Turn Synchronization
- **Issue**: Synchronizing turns between human players and AI can be challenging, particularly when there are multiple human players.
- **Solution**: To address this, we use a **turn queue** system that keeps track of actions for each player, ensuring actions are executed in a logical and orderly manner.

### 2. AI Reaction Timing
- **Issue**: The AI must balance between responding quickly and making calculated decisions.
- **Solution**: The AI is given a fixed time to process its decisions, using **parallel computation** when necessary to determine optimal actions without delaying the player's experience.

## Conclusion
The turn-based system in 8192 is designed to provide a balanced, engaging, and strategic experience for players. By breaking down each turn into structured phases, players have time to consider their moves, while the AI remains adaptable to keep the game challenging. The updated timing structure, with **73.828-second game cycles** extending across a **two-week period**, ensures synchronization without downtime, creating a seamless gameplay experience. Understanding these turn mechanics is essential for making modifications, adding new game features, and ensuring an optimal gameplay experience.

For more detailed information on specific turn actions and their implementation, please refer to the **Turn Actions Implementation Guide** located in the `/docs` directory.

