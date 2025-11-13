import Link from "next/link";
import React from "react";

interface PoolModalProps {
  setShowModal: (show: boolean) => void;
  pool: {
    poolId: number;
    poolEnded?: boolean;
    baseamount?: string;
    totalAmount?: string;
    totalPlayers?: number;
    playersLeft?: number;
    result?: number;
    endTime?: number;
    ended?: boolean;
    totalamount?: string;
    totalplayers?: number;
  } | null;
}

const PoolModal = ({ setShowModal, pool }: PoolModalProps) => {
  if (!pool) {
    return null;
  }

  // Helper function to safely convert BigInt/string to number
  const toNumber = (value: string | number | bigint | undefined): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'string') return Number(value) || 0;
    return value;
  };

  // Helper function to format wei to token amount with proper parsing for long values
  const formatToken = (value: string | number | bigint | undefined): string => {
    const num = toNumber(value);
    const tokenAmount = num / 1e18;
    
    // Format large numbers
    if (tokenAmount >= 1e9) {
      return `${(tokenAmount / 1e9).toFixed(2)}B`;
    } else if (tokenAmount >= 1e6) {
      return `${(tokenAmount / 1e6).toFixed(2)}M`;
    } else if (tokenAmount >= 1e3) {
      return `${(tokenAmount / 1e3).toFixed(2)}K`;
    } else if (tokenAmount >= 1) {
      return tokenAmount.toFixed(4);
    } else if (tokenAmount >= 0.0001) {
      return tokenAmount.toFixed(6);
    } else {
      return tokenAmount.toExponential(2);
    }
  };

  // Helper function to format numbers (for players, etc.)
  const formatNumber = (value: number): string => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    }
    return value.toString();
  };

  // Calculate values safely
  const totalPlayers = pool.totalPlayers || pool.totalPlayers || 0;
  const playersLeft = pool.playersLeft || 0;
  const playersJoined = totalPlayers - playersLeft;
  const totalAmount = pool.totalAmount || '0';
  const baseAmount =  pool.baseamount || '0';
  const isEnded = pool.poolEnded || pool.ended || false;
  const result = pool.result || '';
  
  // Handle endTime - it might be in seconds (from contract) or milliseconds
  let endTimeDisplay = 'N/A';
  if (pool.endTime) {
    const endTimeNum = toNumber(pool.endTime);
    // If endTime is less than a reasonable timestamp (year 2000), assume it's in seconds
    const timestamp = endTimeNum < 946684800000 ? endTimeNum * 1000 : endTimeNum;
    try {
      endTimeDisplay = new Date(timestamp).toLocaleString();
    } catch (e) {
      endTimeDisplay = 'Invalid Date';
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-lg relative">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-3 right-4 cursor-pointer text-black hover:text-gray-700 text-xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-md font-semibold mb-4 text-center text-black">
          🎲 Pool # {formatNumber(pool.poolId)}
        </h2>

        <div className="w-full">
          <table className="w-full text-sm text-left text-black border border-gray-200 rounded-lg overflow-hidden">
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2 font-medium whitespace-nowrap text-black">
                  👥 Players Joined
                </td>
                <td className="px-4 py-2 text-right text-black">
                  <span className="font-semibold text-black">
                    {formatNumber(playersJoined)}
                  </span>
                  <span className="text-black"> / {formatNumber(totalPlayers)}</span>
                </td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="px-4 py-2 font-medium whitespace-nowrap text-black">
                  💰 Total Liquidity
                </td>
                <td className="px-4 py-2 text-right text-black break-words">
                  {totalAmount} STT
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2 font-medium text-black">🎯 Base Entry</td>
                <td className="px-4 py-2 text-right text-black break-words">
                  {baseAmount} STT
                </td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="px-4 py-2 font-medium text-black">⏱️ Pool Ends</td>
                <td className="px-4 py-2 text-right text-black break-words text-xs">
                  {endTimeDisplay}
                </td>
              </tr>

              {isEnded && (
                <tr className="border-b bg-gray-50">
                  <td className="px-4 py-2 font-medium text-black">🎲 Outcome</td>
                  <td className="px-4 py-2 text-right text-black">
                    <span className="font-semibold text-black">{result}</span>
                  </td>
                </tr>
              )}

              <tr>
                <td className="px-4 py-2 font-medium text-black">🚦 Status</td>
                <td className="px-4 py-2 text-right text-black">
                  {isEnded ? (
                    <span className="font-semibold text-black">Ended</span>
                  ) : (
                    <span className="font-semibold text-black">Open</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center">
          {isEnded ? (
            <button className="retro rbtn-small text-sm opacity-50 cursor-not-allowed text-black">
              <Link href={`/play?poolId=${pool.poolId}`} className="text-black no-underline">
                Pool Ended
              </Link>
            </button>
          ) : (
            <button className="retro cursor-pointer rbtn-small text-sm text-black">
              <Link href={`/play?poolId=${pool.poolId}`} className="text-black no-underline">
                Play Now
              </Link>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoolModal;
