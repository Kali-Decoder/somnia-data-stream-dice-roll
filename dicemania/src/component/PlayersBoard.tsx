import React from "react";
import { formatUnits } from "viem";

interface PlayerBet {
  user: string;
  amount: bigint | string | number;
  targetScore: bigint | string | number;
  claimedAmount?: bigint | string | number;
  claimed?: boolean;
}

interface PlayersBoardProps {
  players?: PlayerBet[];
}

const PlayersBoard = ({ players }: PlayersBoardProps) => {
  if (!players || players.length === 0) {
    return (
      <div className="w-1/3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg shadow-lg p-4">
        <h2 className="text-md font-bold mb-4 text-center text-black">
          🏆 Players Board
        </h2>
        <p className="text-center text-gray-500 text-sm">No players yet!</p>
      </div>
    );
  }

  // Helper function to parse and format amount
  const formatAmount = (amount: bigint | string | number | undefined): string => {
    if (!amount) return "0.00";
    
    try {
      let amountBigInt: bigint;
      
      if (typeof amount === 'bigint') {
        amountBigInt = amount;
      } else if (typeof amount === 'string') {
        amountBigInt = BigInt(amount);
      } else {
        amountBigInt = BigInt(amount);
      }
      
      // Convert from wei to ether (18 decimals)
      const formatted = formatUnits(amountBigInt, 18);
      return parseFloat(formatted).toFixed(2);
    } catch (error) {
      console.error("Error formatting amount:", error);
      return "0.0000";
    }
  };

  // Helper function to parse target score
  const parseTargetScore = (targetScore: bigint | string | number | undefined): number => {
    if (!targetScore) return 0;
    
    try {
      if (typeof targetScore === 'bigint') {
        return Number(targetScore);
      } else if (typeof targetScore === 'string') {
        return Number(targetScore);
      } else {
        return Number(targetScore);
      }
    } catch (error) {
      console.error("Error parsing target score:", error);
      return 0;
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg shadow-lg p-4">
      <h2 className="text-md font-bold mb-4 text-center text-black">
        🏆 Players Board
      </h2>
      <div className="overflow-x-auto text-xs">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Address
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Bet
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Prediction
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player, index) => (
              <tr key={index} className="hover:bg-purple-50">
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-800">
                  {shortenAddress(player.user)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-green-600 font-bold">
                  {formatAmount(player.amount)} STT
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-800 font-semibold">
                  {parseTargetScore(player.targetScore)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper function to shorten address like 0xabc...xyz
const shortenAddress = (address: string | undefined): string => {
  if (!address) return "-";
  if (typeof address !== 'string') return "-";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default PlayersBoard;
