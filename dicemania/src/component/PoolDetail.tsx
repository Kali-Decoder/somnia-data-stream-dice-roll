"use client";

import React, { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import JoinModal from "./JoinModal";
import { setResultAPI } from "@/lib/api/poolApi";
import { useContractInfo } from "@/hooks/useContractInfo";

interface PoolDetailProps {
  singlePoolDetail: Array<{
    poolId: bigint | number;
    totalamount?: bigint | string | number;
    totalplayers?: number;
    playersLeft?: number;
    poolEnded?: boolean;
    ended?: boolean;
    baseamount?: bigint | string | number;
    endtime?: number;
    endTime?: number;
    result?: bigint | number;
    bets?: Array<{
      user: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  }>;
  onRefresh?: () => void;
}

const PoolDetail = ({ singlePoolDetail, onRefresh }: PoolDetailProps) => {
  const { address } = useAccount();
  const router = useRouter();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { abi, contractAddress } = useContractInfo();

  // Check if user is owner
  const { data: ownerData } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "owner",
  });

  const isOwner = ownerData && address && typeof ownerData === 'string' && ownerData.toLowerCase() === address.toLowerCase();

  const handleResolvePool = async (poolId: bigint | number) => {
    try {

      const resultValue = Math.floor(Math.random() * 6) + 1;
      
      await setResultAPI(poolId.toString(), resultValue.toString());
      toast.success("Pool resolved successfully!");
      
      // Refresh the page data
      if (onRefresh) {
        onRefresh();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error in resolving pool", error);
      toast.error(error?.message || "Failed to resolve pool");
    }
  };

  const refreshPage = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
  };

  return (
    <>
      {" "}
      <div className="w-full bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg shadow-lg p-6 py-3">
        <div className="flex justify-between items-baseline mb-6">
          <button className="retro cursor-pointer rbtn-small text-sm ">
            <a href="/">👈</a>
          </button>

          <h2 className="text-md text-black font-extrabold text-center">
            💰 Pool Details
          </h2>
        </div>

        {address ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-gray-800 border border-gray-300 rounded-lg overflow-hidden">
                <tbody className="bg-white divide-y divide-gray-300">
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Liquidity Pool:
                    </td>
                    <td className="py-3 px-4">
                      {(() => {
                        const totalAmount = singlePoolDetail?.[0]?.totalamount || singlePoolDetail?.[0]?.totalAmount || 0;
                        const amount = typeof totalAmount === 'bigint' ? Number(totalAmount) / 1e18 : Number(totalAmount);
                        return amount.toFixed(4);
                      })()} STT
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Connected Account:
                    </td>
                    <td className="py-3 px-4">
                      {address?.slice(0, 6) + "..." + address?.slice(-4)}
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Number of Players:
                    </td>
                    <td className="py-3 px-4">
                      {singlePoolDetail?.[0]?.totalplayers}
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Players Space Left:
                    </td>
                    <td className="py-3 px-4">
                      {singlePoolDetail?.[0]?.playersLeft}
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Pool Status:
                    </td>
                    <td className="py-3 px-4">
                      {!singlePoolDetail?.[0]?.poolEnded && !singlePoolDetail?.[0]?.ended ? (
                        <span className="text-green-600 font-bold">
                          OnGoing
                        </span>
                      ) : (
                        <span className="text-red-600 font-bold">Ended</span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Base Amount:
                    </td>
                    <td className="py-3 px-4">
                      {(() => {
                        const baseAmount = singlePoolDetail?.[0]?.baseamount || 0;
                        const amount = typeof baseAmount === 'bigint' ? Number(baseAmount) / 1e18 : Number(baseAmount);
                        return amount.toFixed(4);
                      })()} STT
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      End Time:
                    </td>
                    <td className="py-3 px-4">
                      {(() => {
                        const endTime = singlePoolDetail?.[0]?.endtime || singlePoolDetail?.[0]?.endTime || 0;
                        const timestamp = Number(endTime) < 946684800000 ? Number(endTime) * 1000 : Number(endTime);
                        return new Date(timestamp).toLocaleString();
                      })()}
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Result:
                    </td>
                    <td className="py-3 px-4">
                      {singlePoolDetail?.[0]?.result
                        ? Number(singlePoolDetail[0].result)
                        : "Not Declared"}
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      Bet Status
                    </td>
                    <td className="py-3 px-4">
                      {singlePoolDetail?.[0]?.bets?.find(
                        (bet) =>
                          bet?.user?.toLowerCase() === address?.toLowerCase()
                      )?.user ? (
                        <button
                          disabled={true}
                          className="retro cursor-pointer rbtn-small text-sm "
                        >
                          Already Betted
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowJoinModal(true)}
                          className="retro rbtn-small text-sm"
                        >
                          Join Pool
                        </button>
                      )}
                    </td>
                  </tr>

                  {isOwner && !singlePoolDetail?.[0]?.poolEnded && !singlePoolDetail?.[0]?.ended ? (
                    <tr className="bg-transparent">
                      <td className="py-1 px-2">
                        <button
                          onClick={() => {
                            handleResolvePool(singlePoolDetail?.[0]?.poolId);
                          }}
                          className="retro whitespace-nowrap cursor-pointer rbtn-small text-sm "
                        >
                          Resolve Pool
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            refreshPage();
                          }}
                          className="retro cursor-pointer rbtn-small text-sm "
                        >
                          ⮑
                        </button>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-black mb-4">Please connect your wallet to view pool details</p>
          </div>
        )}
      </div>
      {showJoinModal && (
        <JoinModal
          setShowJoinModal={setShowJoinModal}
          pool={singlePoolDetail?.[0]}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
};

export default PoolDetail;
