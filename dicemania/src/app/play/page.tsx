"use client";

import PoolComponent from "@/component/PoolComponent";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getPoolByIdAPI, getPoolBetsAPI } from "@/lib/api/poolApi";
import type { Pool, PlayerBet } from "@/lib/somnia/gameService";

const PageContent = () => {
  const searchParams = useSearchParams();
  const poolId = searchParams.get("poolId");

  const [loading, setLoading] = useState(true);
  const [poolData, setPoolData] = useState<Pool | null>(null);
  const [poolBets, setPoolBets] = useState<PlayerBet[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!poolId) {
        setError("Pool ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch pool details
        const pool = await getPoolByIdAPI(poolId);
        if (!pool) {
          setError("Pool not found");
          setLoading(false);
          return;
        }

        setPoolData(pool);

        // Fetch pool bets
        try {
          const bets = await getPoolBetsAPI(poolId);
          setPoolBets(bets);
        } catch (betError) {
          console.warn("Failed to fetch pool bets:", betError);
          setPoolBets([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch pool:", err);
        setError(err?.message || "Failed to fetch pool");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [poolId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <h1 className="uppercase text-xl">Loading Pool...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="uppercase text-xl text-red-500">Error: {error}</h1>
        </div>
      </div>
    );
  }

  if (!poolData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="uppercase text-xl">Pool not found</h1>
        </div>
      </div>
    );
  }

  // Format pool data for PoolComponent (it expects an array with bets)
  const formattedPoolData = [{
    ...poolData,
    bets: poolBets,
    poolEnded: poolData.ended,
    totalamount: poolData.totalAmount,
    totalplayers: Number(poolData.totalPlayers),
    baseamount: poolData.baseAmount,
    endtime: Number(poolData.endTime),
  }];

  const handleRefresh = async () => {
    if (!poolId) return;
    try {
      setLoading(true);
      const pool = await getPoolByIdAPI(poolId);
      if (pool) {
        setPoolData(pool);
        const bets = await getPoolBetsAPI(poolId);
        setPoolBets(bets);
      }
    } catch (err: any) {
      console.error("Failed to refresh pool:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PoolComponent 
      singlePoolDetail={formattedPoolData} 
      onRefresh={handleRefresh}
    />
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default Page;
