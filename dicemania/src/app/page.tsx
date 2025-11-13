"use client";
import { useEffect, useState } from "react";
import { useReadContract, useAccount } from "wagmi";
import { formatEther, formatUnits, parseEther } from "viem";
import PoolModal from "@/component/PoolModal";
import Navbar from "@/component/Navbar";
import OnboardingTutorial from "@/component/OnboardingTutorial";
import { PageTransition } from "@/component/PageTransition";
import { useContractInfo } from "@/hooks/useContractInfo";
import { getAllPoolsAPI } from "@/lib/api/poolApi";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [totalPools, setTotalPools] = useState<any[]>([]);
  const [filteredPools, setFilteredPools] = useState<any[]>([]);
  const [isPoolsLoading, setIsPoolsLoading] = useState(true);
  const [selectPoolId, setSelectPoolId] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { abi, contractAddress } = useContractInfo();

  // Check if user has seen onboarding before
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("diceMania_onboarding_completed");
    if (!hasSeenOnboarding) {
      // Show onboarding after a short delay for better UX
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);
  const { data: poolIdData, isLoading: isPoolIdLoading } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "poolId",
  });

  // Fetch all pools when poolId is available
  useEffect(() => {
    const fetchPools = async () => {
      if (isPoolIdLoading || !poolIdData) {
        setIsPoolsLoading(true);
        return;
      }
      try {
        setIsPoolsLoading(true);
        const totalPoolCount = Number(poolIdData);
        
        if (totalPoolCount === 0) {
          setTotalPools([]);
          setFilteredPools([]);
          setIsPoolsLoading(false);
          return;
        }

        // Fetch all pools from API using getAllPoolsAPI
        const pools = await getAllPoolsAPI(totalPoolCount);
        
        console.log(pools);
        const formattedPools = pools.map((pool) => ({
          poolId: Number(pool.poolId),
          poolEnded: pool.ended,
          baseamount: formatUnits(pool.baseAmount,18), // Convert from wei to ether string
          totalAmount: formatUnits(pool.totalAmount,18), // Convert from wei to ether string
          totalPlayers: Number(pool.totalPlayers),
          playersLeft: Number(pool.playersLeft),
          result: Number(pool.result),
          endTime: Number(pool.endTime),
          startTime: Number(pool.startTime),
        }));
        
        console.log(formattedPools);
        setTotalPools(formattedPools);
        setFilteredPools(formattedPools);
      } catch (error) {
        console.error("Failed to fetch pools:", error);
        setTotalPools([]);
        setFilteredPools([]);
      } finally {
        setIsPoolsLoading(false);
      }
    };

    fetchPools();
  }, [poolIdData, isPoolIdLoading]);

  const filterPools = (status: string) => {
    if (status === "all") {
      setFilteredPools(totalPools);
      return;
    }
    const filtered = totalPools.filter((pool) => {
      if (status === "ongoing") {
        return !pool.poolEnded;
      } else if (status === "ended") {
        return pool.poolEnded;
      }
      return true; // Show all pools by default
    });
    setFilteredPools(filtered);
  };

  return (
    <>
      <PageTransition>
        <Navbar />
        <div className=" w-[80%] mt-28 flex-col mx-auto bg-[#000618] ">
          <header>
            <h1 className="uppercase mb-4">
              {isPoolsLoading ? "Loading Pools ..." : "Dice Mania Pools"}
            </h1>
          </header>
          <div className="flex">
            <div className="flex items-center">
              <button
                onClick={() => filterPools("all")}
                className="retro rbtn-small text-xs mr-4 focus:bg-purple-500 active:bg-blue-500 "
              >
                All
              </button>
              <button
                onClick={() => filterPools("ongoing")}
                className="retro rbtn-small text-xs mr-4 focus:bg-purple-500"
              >
                On Going Pools
              </button>
              <button
                onClick={() => filterPools("ended")}
                className="retro rbtn-small text-xs mr-4 focus:bg-purple-500"
              >
                Ended Pools
              </button>
            </div>
          </div>

          <main className="mt-8">
            <section>
              {isPoolsLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                    <h1 className="uppercase text-xl">Loading Pools...</h1>
                  </div>
                </div>
              ) : filteredPools.length === 0 ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <h1 className="uppercase whitespace-nowrap text-xl">No Pools Available</h1>
                </div>
              ) : (
                filteredPools.map((pool) => {
                  return (
                    <div key={pool.poolId} className="relative">
                      {pool?.poolEnded ? (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded shadow  z-10">
                          Ended
                        </div>
                      ) : (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded shadow  z-10">
                          On Going
                        </div>
                      )}

                      <article
                        onClick={() => {
                          setShowModal(true);
                          setSelectPoolId(pool.poolId);
                        }}
                        style={{ color: "#b0b6a9" }}
                        className="cursor-pointer"
                      >
                        <figure>
                          {pool?.poolEnded ? (
                            <img src="https://img.pikbest.com/origin/10/42/57/61fpIkbEsTW5T.png!w700wp" />
                          ) : (
                            <img
                              className="w-60 h-60 mt-14"
                              src="https://png.pngtree.com/png-clipart/20240103/original/pngtree-start-game-pixel-text-effect-vector-png-image_14002306.png"
                            />
                          )}

                          <figcaption className="text-sm flex justify-between">
                            <span>Pool: {pool?.poolId}</span>
                            <span>
                              {pool?.poolEnded ? (
                                <span className="text-red-600">🔴</span>
                              ) : (
                                <span>🟢</span>
                              )}
                            </span>
                          </figcaption>

                          <figcaption className="flex justify-between">
                            <span className="text-xs">Fee: </span>
                            <span className="text-xs text-blue-400">
                              {pool?.baseamount} STT
                            </span>
                          </figcaption>
                        </figure>
                      </article>
                    </div>
                  );
                })
              )}
            </section>
          </main>
        </div>

        {showModal && totalPools.length > 0 && (
          <PoolModal
            setShowModal={setShowModal}
            pool={totalPools.find((p) => p.poolId === selectPoolId) || totalPools[0]}
          />
        )}

        {showOnboarding && (
          <OnboardingTutorial
            onComplete={() => setShowOnboarding(false)}
          />
        )}
      </PageTransition>
    </>
  );
}
