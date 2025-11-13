"use client";

import React, { useState, } from "react";
import { X,Wallet, Eye, Dice6, Trophy, CheckCircle } from "lucide-react";

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const OnboardingTutorial = ({ onComplete }: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to DiceMania! 🎲",
      description: "A decentralized dice prediction game where you bet on dice outcomes and compete for rewards!",
      icon: <Dice6 className="w-12 h-12 text-purple-600" />,
      content: (
        <div className="text-center space-y-3">
          <p className="text-gray-700 text-sm">
            Get ready to roll the dice and win big! Follow these simple steps to get started.
          </p>
          <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200">
            <p className="text-xs text-gray-600">
              💡 <strong>Tip:</strong> Make sure you have Somnia Testnet added to your wallet and some STT tokens for transactions!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Step 1: Connect Your Wallet",
      description: "Connect your Web3 wallet to start playing",
      icon: <Wallet className="w-12 h-12 text-blue-600" />,
      content: (
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
            <ol className="list-decimal list-inside space-y-1.5 text-left text-xs text-gray-700">
              <li>Click the <strong>"Connect Wallet"</strong> button in the top right corner</li>
              <li>Select your wallet (MetaMask recommended)</li>
              <li>Ensure you're connected to <strong>Somnia Testnet</strong></li>
              <li>Approve the connection request</li>
            </ol>
          </div>
          <div className="bg-yellow-50 p-2 rounded-lg border-2 border-yellow-200">
            <p className="text-xs text-gray-600">
              ⚠️ <strong>Important:</strong> Make sure you're on Somnia Testnet, not Mainnet!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Step 2: Browse Available Pools",
      description: "View all active betting pools on the home page",
      icon: <Eye className="w-12 h-12 text-green-600" />,
      content: (
        <div className="space-y-3">
          <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
            <p className="text-xs text-gray-700 mb-2">
              Each pool card shows:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-left text-xs text-gray-700">
              <li><strong>Pool ID:</strong> Unique identifier</li>
              <li><strong>Base Amount:</strong> Entry fee to join (in STT)</li>
              <li><strong>Total Players:</strong> Maximum players allowed</li>
              <li><strong>Players Left:</strong> Available spots remaining</li>
              <li><strong>End Time:</strong> When the pool closes</li>
            </ul>
          </div>
          <p className="text-xs text-gray-600 text-center">
            Click on any pool card to view details and join!
          </p>
        </div>
      ),
    },
    {
      title: "Step 3: Join a Pool & Make Your Prediction",
      description: "Select your dice prediction and place your bet",
      icon: <Dice6 className="w-12 h-12 text-purple-600" />,
      content: (
        <div className="space-y-3">
          <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200">
            <ol className="list-decimal list-inside space-y-1.5 text-left text-xs text-gray-700">
              <li>Click on a pool card to open the pool page</li>
              <li>Click the <strong>"Join Pool"</strong> button</li>
              <li>Select your dice prediction (1-6) by clicking on the dice face</li>
              <li>Click <strong>"Submit Prediction"</strong></li>
              <li>Approve the transaction in your wallet</li>
              <li>Wait for transaction confirmation</li>
            </ol>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg border-2 border-blue-200">
            <p className="text-xs text-gray-600">
              🎯 <strong>Strategy:</strong> Choose wisely! You can only place one bet per pool.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Step 4: Wait for Pool Resolution",
      description: "The pool owner will resolve the pool after the end time",
      icon: <CheckCircle className="w-12 h-12 text-orange-600" />,
      content: (
        <div className="space-y-3">
          <div className="bg-orange-50 p-3 rounded-lg border-2 border-orange-200">
            <p className="text-xs text-gray-700 mb-2">
              What happens next:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-left text-xs text-gray-700">
              <li>Wait until the pool <strong>end time</strong> is reached</li>
              <li>The pool owner will <strong>resolve the pool</strong> by setting the dice result</li>
              <li>The system automatically calculates <strong>winners</strong></li>
              <li>Winners are those whose prediction matches the result!</li>
            </ul>
          </div>
          <p className="text-xs text-gray-600 text-center">
            You can check the pool status and see all players on the pool page!
          </p>
        </div>
      ),
    },
    {
      title: "Step 5: Claim Your Rewards",
      description: "If you won, claim your share of the pool rewards!",
      icon: <Trophy className="w-12 h-12 text-yellow-600" />,
      content: (
        <div className="space-y-3">
          <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-200">
            <p className="text-xs text-gray-700 mb-2">
              Winning and claiming:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-left text-xs text-gray-700">
              <li>If your prediction matches the result, <strong>you win!</strong> 🎉</li>
              <li>Rewards are distributed <strong>equally</strong> among all winners</li>
              <li>Click the <strong>"Claim Bet"</strong> button (if available)</li>
              <li>Approve the transaction to receive your rewards</li>
              <li>You also earn <strong>50 points</strong> for winning!</li>
            </ul>
          </div>
          <div className="bg-green-50 p-2 rounded-lg border-2 border-green-200">
            <p className="text-xs text-gray-600">
              💰 <strong>Rewards:</strong> The total pool amount is divided equally among all winners!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Bonus: Points & Leaderboard",
      description: "Earn points and compete on the leaderboard!",
      icon: <Trophy className="w-12 h-12 text-yellow-600" />,
      content: (
        <div className="space-y-3">
          <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-200">
            <p className="text-xs text-gray-700 mb-2">
              Points system:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-left text-xs text-gray-700">
              <li><strong>10 points</strong> for placing a bet</li>
              <li><strong>50 points</strong> for winning a pool</li>
              <li>Check your ranking on the <strong>Leaderboard</strong> page</li>
              <li>Compete with other players for the top spots!</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-2 rounded-lg border-2 border-purple-200">
            <p className="text-xs text-gray-600">
              🏆 Access the leaderboard from the navigation menu to see top players!
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("diceMania_onboarding_completed", "true");
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-black relative">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Progress indicator */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step content */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="scale-75">
                {steps[currentStep].icon}
              </div>
            </div>
            <h2 className="text-lg font-bold text-black mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {steps[currentStep].description}
            </p>
            <div className="text-left">
              {steps[currentStep].content}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`retro rbtn-small text-xs flex items-center gap-1.5 ${
                currentStep === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
            
              Previous
            </button>

            <button
              onClick={handleSkip}
              className="text-xs text-gray-500 hover:text-black underline"
            >
              Skip Tutorial
            </button>

            <button
              onClick={handleNext}
              className="retro rbtn-small text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started
    
                </>
              ) : (
                <>
                  Next
            
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;

