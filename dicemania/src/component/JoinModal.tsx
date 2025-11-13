import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { toast } from "react-hot-toast";
import { parseEther } from "viem";
import { placeBetAPI } from "@/lib/api/poolApi";
import { useContractInfo } from "@/hooks/useContractInfo";

interface JoinModalProps {
  setShowJoinModal: (show: boolean) => void;
  pool: {
    poolId: bigint | number;
    baseamount?: bigint | string | number;
    baseAmount?: bigint | string | number;
    [key: string]: any;
  };
  onSuccess?: () => void;
}

const JoinModal = ({ setShowJoinModal, pool, onSuccess }: JoinModalProps) => {
  const [selectedFace, setSelectedFace] = useState<number | null>(null);
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

  const baseAmount = pool?.baseamount || pool?.baseAmount || 0;
  let amountInWei: string;
  
  if (typeof baseAmount === 'bigint') {
    amountInWei = baseAmount.toString();
  } else if (typeof baseAmount === 'string') {
    const numAmount = Number(baseAmount);
    if (numAmount < 1e10) {
      // Likely in ether format, convert to wei
      amountInWei = parseEther(baseAmount).toString();
    } else {
      // Already in wei
      amountInWei = baseAmount;
    }
  } else {
    // Number - assume it's in ether format
    amountInWei = parseEther(baseAmount.toString()).toString();
  }

  const poolId = typeof pool.poolId === 'bigint' ? pool.poolId.toString() : pool.poolId.toString();
  
  const handleSelect = (face: number) => {
    setSelectedFace(face);
  };

  const handleTransactionConfirmed = useCallback(async (txHash: string) => {
    if (processedTxHash.current === txHash) {
      return;
    }
    processedTxHash.current = txHash;
    try {
      const result = await placeBetAPI(
        poolId,
        address!,
        amountInWei,
        selectedFace!.toString()
      );
      
      toast.success("Successfully joined the pool!");
      setShowJoinModal(false);
      if (onSuccess) {
        onSuccess();
      }
      processedTxHash.current = null;
    } catch (error: any) {
      console.error("Error in adding to pool", error);
      toast.error(error?.message || "Failed to join pool");
      processedTxHash.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [poolId, address, amountInWei, selectedFace, setShowJoinModal, onSuccess]);

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

  const handlePoolJoin = async () => {
    if (!selectedFace) {
      toast.error("Please select a face");
      return;
    }
    
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsLoading(true);
      const amountInWeiBigInt = BigInt(amountInWei);
      const poolIdBigInt = BigInt(poolId);

      console.log("Placing bet with:", { amountInWeiBigInt, selectedFace, poolIdBigInt });
      const tx = await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'placeBet',
        args: [amountInWeiBigInt, BigInt(selectedFace), poolIdBigInt],
        value: amountInWeiBigInt,
      });
      console.log("Transaction hash:", tx);

    } catch (error: any) {
      console.error("Failed to initiate transaction:", error);
      toast.error(error?.message || "Failed to join pool");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
        <button
          onClick={() => setShowJoinModal(false)}
          className="absolute top-3 right-4 cursor-pointer text-gray-500 hover:text-black text-xl"
        >
          &times;
        </button>

        <div className="flex gap-2 flex-wrap justify-center mt-6">
          <div
            className={`cursor-pointer border-2 rounded-lg p-2 ${
              selectedFace === 1
                ? "border-green-500 bg-green-100"
                : "border-gray-300"
            }`}
            onClick={() => handleSelect(1)}
          >
            <div className={`first-face`}>
              <div className="column">
                <span className="pip"></span>
              </div>
            </div>
          </div>
          <div
            className={`cursor-pointer border-2 rounded-lg p-2 ${
              selectedFace === 2
                ? "border-green-500 bg-green-100"
                : "border-gray-300"
            }`}
            onClick={() => handleSelect(2)}
          >
            <div className="second-face">
              <span className="pip"></span>
              <span className="pip"></span>
            </div>
          </div>
          <div
            className={`cursor-pointer border-2 rounded-lg p-2 ${
              selectedFace === 3
                ? "border-green-500 bg-green-100"
                : "border-gray-300"
            }`}
            onClick={() => handleSelect(3)}
          >
            <div className="third-face">
              <span className="pip"></span>
              <span className="pip"></span>
              <span className="pip"></span>
            </div>
          </div>
          <div
            className={`cursor-pointer border-2 rounded-lg p-2 ${
              selectedFace === 4
                ? "border-green-500 bg-green-100"
                : "border-gray-300"
            }`}
            onClick={() => handleSelect(4)}
          >
            <div className="fourth-face">
              <div className="column">
                <span className="pip"></span>
                <span className="pip"></span>
              </div>
              <div className="column">
                <span className="pip"></span>
                <span className="pip"></span>
              </div>
            </div>
          </div>

          <div
            className={`cursor-pointer border-2 rounded-lg p-2 ${
              selectedFace === 5
                ? "border-green-500 bg-green-100"
                : "border-gray-300"
            }`}
            onClick={() => handleSelect(5)}
          >
            <div className="fifth-face">
              <div className="column">
                <span className="pip"></span>
                <span className="pip"></span>
              </div>
              <div className="column">
                <span className="pip"></span>
              </div>
              <div className="column">
                <span className="pip"></span>
                <span className="pip"></span>
              </div>
            </div>
          </div>
          <div
            className={`cursor-pointer border-2 rounded-lg p-2 ${
              selectedFace === 6
                ? "border-green-500 bg-green-100"
                : "border-gray-300"
            }`}
            onClick={() => handleSelect(6)}
          >
            <div className="sixth-face">
              <div className="column">
                <span className="pip"></span>
                <span className="pip"></span>
                <span className="pip"></span>
              </div>
              <div className="column">
                <span className="pip"></span>
                <span className="pip"></span>
                <span className="pip"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            className="retro cursor-pointer rbtn-small text-sm"
            disabled={selectedFace === null || isLoading || isWritePending || isConfirming || !isConnected}
            onClick={handlePoolJoin}
          >
            {isLoading || isWritePending
              ? "Waiting for wallet..."
              : isConfirming
              ? "Confirming transaction..."
              : "Submit Prediction"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinModal;
