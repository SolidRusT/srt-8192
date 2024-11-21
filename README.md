# 8192: A Turn-Based Leadership Simulator

## Overview

**8192** is a revolutionary turn-based online multiplayer game that teaches players leadership skills, military and economic management, while competing in a future Earth-type setting where an advanced AI attempts to exterminate humanity. The turn-based gameplay resets every 8192 cycles, allowing new players to join in and helping maintain balance while rewarding long-term players with permanent in-game rewards, including coins, experience, profile badges, and rare skins.

**8192** is part of a larger simulation game called **LeadSim**, which itself is part of the expansive virtual world known as **Future Earth**, developed and operated by **SolidRusT Networks (SRT)**.

## Repository Information

- **GitHub Repository**: [https://github.com/SolidRusT/srt-8192](https://github.com/SolidRusT/srt-8192)
- **Developer Website**: [https://solidrust.net](https://solidrust.net)
- **License**: MIT License

## Features

- **Turn-Based Gameplay**: Engage in strategic turn-based competition that resets every 8192 cycles.
- **Leadership Skills Development**: Players develop military, economic, and leadership skills through challenges and decision-making.
- **Real-World Data Integration**: The game dynamically adapts based on real-world data, including climate, economic, and geopolitical events.
- **Advanced AI Opponent**: The AI adapts to player behavior and real-world events, offering a unique challenge each time.
- **Permanent Rewards**: Earn and retain in-game coins, experience, badges, and rare cosmetic skins.
- **Part of the Future Earth Virtual World**: Experience a cohesive world alongside other simulations from SolidRusT Networks.

## Project Structure

```
8192/
├── backend (a.k.a. 'BrainCore')/
│   ├── ai (a.k.a. 'NexusMind')/
│   ├── services (a.k.a. 'OpsHub')/
│   │   ├── matchmaking/
│   │   ├── game-logic/
│   │   ├── user-profile/
│   │   └── economy-management/
│   ├── utils (a.k.a. 'ToolKit')/
│   ├── data-integration (a.k.a. 'DataForge')/
│   └── serverless-functions (a.k.a. 'CloudSpirits')/
│       ├── DataPulse/
│       └── game-events-handler/
├── frontend (a.k.a. 'PlayerPortal')/
│   ├── components (a.k.a. 'LegoBlocks')/
│   ├── pages (a.k.a. 'ViewScreens')/
│   ├── hooks (a.k.a. 'MagicHooks')/
│   ├── styles (a.k.a. 'RoboThreads')/
│   └── utils/
├── infra (a.k.a. 'SkyRig')/
│   ├── k8s (a.k.a. 'ClusterCommander')/
│   ├── terraform (a.k.a. 'TerraSculptor')/
│   └── monitoring (a.k.a. 'EyeOfSauron')/
├── docs (a.k.a. 'KnowledgeVault')/
│   ├── architecture.md
│   ├── game-mechanics.md
│   ├── api-specs.md
│   └── contributing.md
├── scripts (a.k.a. 'Rituals')/
│   ├── deploy.sh
│   ├── build.sh
│   └── setup-dev.sh
├── tests (a.k.a. 'TrialGrounds')/
│   ├── frontend/
│   └── backend/
├── README.md
├── LICENSE
└── .gitignore
```

### Directory Breakdown

- **backend/**: Contains the core backend services, AI logic, utilities, and serverless functions.
  - **ai/**: AI decision-making logic and ML models.
  - **services/**: Microservices such as matchmaking, game-logic, user-profile, and economy-management.
  - **utils/**: Reusable backend utilities and helpers.
  - **data-integration/**: Manages integration with external real-world data sources.
  - **serverless-functions/**: Stateless functions that run backend operations in a serverless environment.
    - **real-world-data-fetcher/**: Handles real-time data fetching from climate, economy, etc.
    - **game-events-handler/**: Manages game event triggers.

- **frontend/**: Contains the client-side application.
  - **components/**: Reusable React components.
  - **pages/**: Page-level components for the app.
  - **hooks/**: Custom hooks to manage shared logic.
  - **styles/**: Tailwind CSS styles and theming.
  - **utils/**: Utility functions for the frontend.

- **infra/**: Contains infrastructure-related configurations.
  - **k8s/**: Kubernetes configurations for deployment.
  - **terraform/**: Terraform scripts for provisioning cloud infrastructure.
  - **monitoring/**: Monitoring and alerting setup.

- **docs/**: Project documentation.
  - **architecture.md**: Detailed documentation of the system architecture.
  - **game-mechanics.md**: Explanation of game rules and mechanics.
  - **api-specs.md**: Specifications for API endpoints.
  - **contributing.md**: Guidelines for contributing to the project.

- **scripts/**: Helpful scripts for deployment, building, and setting up the development environment.

- **tests/**: Contains automated test cases.
  - **frontend/**: Frontend unit and integration tests.
  - **backend/**: Backend services and API tests.

- **README.md**: The main project overview and instructions (this file).
- **LICENSE**: Licensing information (MIT License).
- **.gitignore**: Specifies intentionally untracked files to ignore.

## Getting Started

### Prerequisites
- **Node.js** and **npm** for frontend development.
- **Docker** and **Kubernetes** for containerized development and testing.
- **Terraform** for provisioning cloud infrastructure.

### Setup Instructions
1. **Clone the Repository**:
   ```sh
   git clone https://github.com/SolidRusT/srt-8192.git
   cd srt-8192
   ```

2. **Install Frontend Dependencies**:
   ```sh
   cd frontend
   npm install
   ```

3. **Run Frontend Development Server**:
   ```sh
   npm run dev
   ```

4. **Deploy Backend Services** (using Kubernetes and Terraform):
   ```sh
   ./scripts/deploy.sh
   ```

### Contributing
We welcome contributions from the community! Please see our [contributing guidelines](./docs/contributing.md) for more information on how to get started.

## License
This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments
- **SolidRusT Networks** for the development and operation of the **Future Earth** virtual world.
- All contributors and playtesters who help make **8192** a great experience!
