# 🎲 DiceMania - Decentralized Dice Game

A blockchain-based dice prediction game built on Somnia Testnet where players bet on dice outcomes and compete for rewards!

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [How to Play](#how-to-play)
- [Game Rules](#game-rules)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)

## 🎯 Overview

DiceMania is a decentralized dice game where players:
- Join pools by placing bets on dice outcomes (1-6)
- Compete with other players in the same pool
- Win rewards when their prediction matches the final dice result
- Earn points for participating and winning

## ✨ Features

- 🎲 **Interactive Dice Rolling**: Real-time 3D dice animation
- 💰 **Pool System**: Create and join betting pools
- 🏆 **Leaderboard**: Track top players by points and rewards
- 📊 **Player Board**: See all participants and their predictions
- 🔐 **Web3 Integration**: Connect with MetaMask or other Web3 wallets
- ⚡ **Smart Contracts**: Fully decentralized on Somnia Testnet
- 🎨 **Retro UI**: Beautiful retro-themed user interface

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** package manager
- **MetaMask** or compatible Web3 wallet
- **Somnia Testnet** added to your wallet
- **Testnet tokens** (STT) for transactions

### Adding Somnia Testnet to MetaMask

1. Open MetaMask
2. Go to Settings → Networks → Add Network
3. Add the following details:
   - **Network Name**: Somnia Testnet
   - **RPC URL**: (Check project configuration)
   - **Chain ID**: (Check project configuration)
   - **Currency Symbol**: STT

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DiceMania
```

### 2. Install Dependencies

#### Frontend (Next.js)

```bash
cd dicemania
npm install
# or
pnpm install
```

#### Smart Contracts

```bash
cd dice-web3
npm install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the `dicemania` directory:

```env
NEXT_PUBLIC_RPC_URL=your_somnia_testnet_rpc_url
PRIVATE_KEY=your_private_key_for_server_operations
```

### 4. Deploy Smart Contracts (Optional)

If you need to deploy the contracts:

```bash
cd dice-web3
npx hardhat compile
npx hardhat deploy --network somniaTestnet
```

### 5. Run the Development Server

```bash
cd dicemania
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 How to Play

### Step 1: Connect Your Wallet

1. Click the **"Connect Wallet"** button in the top right corner
2. Select your Web3 wallet (MetaMask recommended)
3. Ensure you're connected to **Somnia Testnet**
4. Approve the connection request

### Step 2: View Available Pools

- On the home page, you'll see all available betting pools
- Each pool shows:
  - **Pool ID**: Unique identifier
  - **Base Amount**: Entry fee required to join
  - **Total Players**: Maximum players allowed
  - **Players Left**: Available spots remaining
  - **End Time**: When the pool closes

### Step 3: Join a Pool

1. Click on any available pool card
2. You'll be redirected to the pool page
3. Click the **"Join Pool"** button
4. Select your dice prediction (1-6) by clicking on the dice face
5. Click **"Submit Prediction"**
6. Approve the transaction in your wallet
7. Wait for transaction confirmation

### Step 4: Wait for Pool Resolution

- Once the pool end time is reached, the pool owner can resolve it
- The owner rolls the dice and sets the result
- Winners are automatically determined based on the result

### Step 5: Claim Your Rewards (If You Won)

1. If your prediction matches the result, you're a winner!
2. Click the **"Claim Bet"** button (if available)
3. Approve the transaction
4. Receive your share of the pool rewards

### Creating a Pool (Pool Owner)

1. Click **"Create Pool"** in the navbar
2. Fill in the details:
   - **Duration**: How long the pool will be open (in seconds)
   - **Total Players**: Maximum number of players
   - **Base Amount**: Entry fee per player (in STT)
3. Click **"Create Pool"**
4. Approve the transaction
5. Your pool will appear on the home page

### Resolving a Pool (Pool Owner Only)

1. Navigate to your pool page
2. Wait until the pool end time has passed
3. Click **"Resolve Pool"** button
4. The system will set a random result (1-6)
5. Winners are automatically calculated and can claim rewards

## 📜 Game Rules

### Betting Rules

- Each player can only place **one bet per pool**
- The bet amount must match the pool's **base amount**
- Predictions must be between **1 and 6** (dice faces)
- Players cannot join after the pool **end time**

### Winning Rules

- If your **prediction matches the final result**, you win!
- Rewards are distributed equally among all winners
- If no one wins, the pool amount stays in the contract
- Winners can claim their rewards after the pool is resolved

### Points System

- **10 points** for placing a bet
- **50 points** for winning a pool
- Points are tracked on the leaderboard

### Pool Rules

- Pools close when:
  - The end time is reached, OR
  - All player slots are filled
- Only the pool owner can resolve the pool
- The pool must be resolved before players can claim rewards

## 📁 Project Structure

```
DiceMania/
├── dicemania/              # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── component/     # React components
│   │   ├── lib/           # Utilities and API calls
│   │   ├── hooks/         # Custom React hooks
│   │   └── constant/      # Constants and configurations
│   └── public/            # Static assets
│
├── dice-web3/             # Smart contracts
│   ├── contracts/        # Solidity contracts
│   ├── deploy/           # Deployment scripts
│   └── test/             # Contract tests
│
└── dicemania-backend/    # Backend API (if applicable)
```

## 🛠 Technology Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Wagmi** - Ethereum React hooks
- **RainbowKit** - Wallet connection UI
- **Viem** - Ethereum utilities
- **React Hot Toast** - Notifications

### Smart Contracts
- **Solidity** - Smart contract language
- **Hardhat** - Development environment
- **Somnia Testnet** - Blockchain network

### Backend
- **Node.js** - Server runtime
- **Next.js API Routes** - API endpoints

## 🎨 UI Features

- **Retro Theme**: Classic gaming aesthetic
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Live pool and player data
- **Smooth Animations**: 3D dice rolling effects
- **Dark/Light Mode**: Adaptive color schemes

## 🔒 Security Notes

- Always verify you're on **Somnia Testnet** before connecting
- Never share your private keys
- Only use testnet tokens for testing
- Review transaction details before approving
- This is a testnet application - use at your own risk

## 📝 Important Notes

- **Testnet Only**: This application runs on Somnia Testnet
- **Test Tokens**: Use only testnet tokens (STT)
- **No Real Money**: This is for testing purposes only
- **Transaction Fees**: Small gas fees apply for each transaction

## 🐛 Troubleshooting

### Wallet Connection Issues
- Ensure MetaMask is installed and unlocked
- Check that you're on Somnia Testnet
- Try disconnecting and reconnecting

### Transaction Failures
- Ensure you have enough STT for gas fees
- Check that the pool hasn't ended
- Verify you haven't already placed a bet

### Pool Not Showing
- Refresh the page
- Check your network connection
- Verify the contract is deployed correctly

## 📞 Support

For issues or questions:
- Check the project documentation
- Review the smart contract code
- Open an issue on the repository

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- Built on Somnia Testnet
- Powered by Next.js and Hardhat
- Inspired by classic dice games

---

**Happy Gaming! 🎲🎉**

