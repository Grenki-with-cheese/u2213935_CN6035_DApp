# Real Estate NFT DApp (Millow)

A hybrid DApp for tokenisation of real estate as ERC-721 NFT and processing transactions using multi-party escrow contract (buyer, sellerm inspector, lender). A TypeScript express backend was added to the original repo + UI changes such as error messages and search.

## Technology Stack & Tools

- Solidity (Writing Smart Contracts & Tests)
- Javascript (React & Testing)
- TypeScript (Backend)
- [Hardhat](https://hardhat.org/) (Development Framework)
- [Ethers.js](https://docs.ethers.io/v5/) (Blockchain Interaction)
- [React.js](https://reactjs.org/) (Frontend Framework)
- [Express.js](https://expressjs.com/) (Backend Framework)
- ESlint + Prettier + Solhint (code quality)

# Prerequisites
- Install [NodeJS](https://nodejs.org/en/) (v18+)
- Install [MetaMask](https://metamask.io/) browser extension
## Setting Up

### 1. Clone/Download the Repository

### 2. Install Dependencies
`$ npm install`
`$ cd backend && npm install && cd ..`

### 3. Run tests
`$ npx hardhat test`

### 4. Start Hardhat node
`$ npx hardhat node`

### 5. Run deployment script
In a separate terminal:
`$ npx hardhat run ./scripts/deploy.js --network localhost`

### 6. Start backend
In the same terminal as step 5 (deploy is one-shot):
`$ cd backend && npm run dev`

### 7. Start frontend
In a third terminal:
`$ npm run start`

## Code Quality

`$ npm run lint`
`$ npm run lint:sol`
`$ npm run format:check`

## What was added on top of the upstream tutorial

- Smart contracts - six events for Escrow state change
- Tests - RealEstate suite + event assertions in Escrow (32 passing total)
- Backend - TypeScript Express service with 3 endpoints (`/api/properties`, `/api/properties/search`, `/api/properties/:id/metadata`) 
- Frontend: reads via backend, loading/error states, wrong-network banner, role badge, working search, tx pending + error toast
- Code quality - ESLint + Prettier + Solhint with npm scripts, prettier-plugin-solidity