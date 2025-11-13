import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { createPoolAPI } from "@/lib/api/poolApi";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from "wagmi";
import { parseEther } from "viem";
import { useContractInfo } from "@/hooks/useContractInfo";

interface CreatePoolModalProps {
  setShowCreatePoolModal: (show: boolean) => void;
}
const CreatePoolModal = ({ setShowCreatePoolModal }: CreatePoolModalProps) => {
  const [playerCount, setPlayerCount] = useState("");
  const [baseAmount, setBaseAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { abi, contractAddress } = useContractInfo();
  const publicClient = usePublicClient();
  const processedTxHash = useRef<string | null>(null);

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleTransactionConfirmed = useCallback(async (txHash: string) => {
    if (processedTxHash.current === txHash) {
      return;
    }
    processedTxHash.current = txHash;
    try {
      let poolId: bigint | null = null;
      if (poolId === null && publicClient) {
        const currentPoolId = await publicClient.readContract({
          address: contractAddress,
          abi: abi,
          functionName: 'poolId',
        }) as bigint;
        poolId = currentPoolId - BigInt(1);
      }

      console.log("Pool ID:", poolId);
      const baseAmountInWei = parseEther(baseAmount).toString();
      const result = await createPoolAPI(
        poolId !== null ? poolId.toString() : "",
        playerCount,
        baseAmountInWei
      );
      toast.success(`Pool created successfully! Pool ID: ${result.poolId} (10 minutes duration)`);
      setShowCreatePoolModal(false);
      setPlayerCount("");
      setBaseAmount("");
      processedTxHash.current = null;
    } catch (error: any) {
      console.error("Failed to create pool:", error);
      toast.error(error?.message || "Failed to create pool");
      processedTxHash.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [baseAmount, playerCount, setShowCreatePoolModal, contractAddress, abi, publicClient]);
  useEffect(() => {
    if (isConfirmed && hash && receipt) {
      handleTransactionConfirmed(hash);
    }
  }, [isConfirmed, hash, receipt, handleTransactionConfirmed]);

  useEffect(() => {
    if (writeError) {
      console.error("Transaction error:", writeError);
      toast.error(writeError.message || "Transaction failed");
      setIsLoading(false);
    }
  }, [writeError]);


  useEffect(() => {
    if (confirmError) {
      console.error("Confirmation error:", confirmError);
      toast.error(confirmError.message || "Transaction confirmation failed");
      setIsLoading(false);
    }
  }, [confirmError]);

  const handleCreatePool = async () => {
    if (!playerCount || !baseAmount) {
      toast.error("Please fill all fields");
      return;
    }

    if (
      isNaN(Number(playerCount)) ||
      isNaN(Number(baseAmount))
    ) {
      toast.error("Please enter valid numbers");
      return;
    }

    if (
      Number(playerCount) <= 0 ||
      Number(baseAmount) <= 0
    ) {
      toast.error("Values must be greater than zero");
      return;
    }

    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsLoading(true);
      const baseAmountInWei = parseEther(baseAmount);

      console.log("Creating pool with:", { playerCount, baseAmountInWei });
      const tx = await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'createPool',
        args: [BigInt(playerCount), baseAmountInWei],
      });
      
      console.log("Transaction hash:", tx);

    } catch (error: any) {
      console.error("Failed to initiate transaction:", error);
      toast.error(error?.message || "Failed to create pool");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
        <button
          onClick={() => setShowCreatePoolModal(false)}
          className="absolute top-3 right-4 cursor-pointer text-gray-500 hover:text-black text-xl"
        >
          &times;
        </button>

        <h2 className="text-lg font-bold text-center mb-4">Create Pool</h2>
        <p className="text-xs text-center text-gray-600 mb-4">
          Pool duration is fixed at 10 minutes
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium">Number of Players</label>
            <input
              type="number"
              value={playerCount}
              onChange={(e) => setPlayerCount(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="e.g., 10"
            />
          </div>

          <div>
            <label className="text-xs font-medium">
              Base Amount (in STT or token)
            </label>
            <input
              type="number"
              value={baseAmount}
              onChange={(e) => setBaseAmount(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="e.g., 0.1"
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            className="retro cursor-pointer rbtn-small text-sm"
            onClick={handleCreatePool}
            disabled={isLoading || isWritePending || isConfirming || !isConnected}
          >
            {isLoading || isWritePending
              ? "Waiting for wallet..."
              : isConfirming
              ? "Confirming transaction..."
              : "Create Pool"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePoolModal;
