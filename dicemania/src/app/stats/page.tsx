"use client";
import { useState, useEffect } from "react";
import Navbar from "@/component/Navbar";
import { PageTransition } from "@/component/PageTransition";
import { getStatsAPI } from "@/lib/api/statsApi";
import AnimatedNumbers from "react-animated-numbers";

interface Stats {
  totalUsers: string;
  totalBetsPlaced: string;
  totalPoolsCreated: string;
  totalPointsAwarded: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  description: string;
}

const StatCard = ({ title, value, icon, color, description }: StatCardProps) => {
  const numValue = parseInt(value) || 0;
  
  return (
    <div
      className="bg-white border-3 bg-yellow-50 border-black p-6 relative"
      style={{ boxShadow: "3px 3px black, 5px 5px white" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
            {title}
          </h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
      <div className="mt-4">
        <div style={{ fontFamily: "atari_classicchunky" }}>
          <AnimatedNumbers
            transitions={(index) => ({
              type: "spring",
              duration: index + 0.3,
            })}
            animateToNumber={numValue}
            fontStyle={{
              fontSize: 40,
              fontWeight: "bold",
              color: color === "text-blue-600" ? "#2563eb" : 
                     color === "text-green-600" ? "#16a34a" :
                     color === "text-purple-600" ? "#9333ea" :
                     color === "text-yellow-600" ? "#ca8a04" : "#000000",
            }}
            locale="en-US"
          />
        </div>
      </div>
    </div>
  );
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getStatsAPI();
      setStats(response.stats);
    } catch (err: any) {
      console.error("Failed to fetch stats:", err);
      setError(err?.message || "Failed to load stats");
      // Set default values on error
      setStats({
        totalUsers: "0",
        totalBetsPlaced: "0",
        totalPoolsCreated: "0",
        totalPointsAwarded: "0",
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <PageTransition>
      <Navbar />
      <div className="w-[90%] max-w-6xl mt-28 mx-auto bg-[#000618] min-h-screen pb-10">
        {/* Header Section */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white uppercase tracking-wider">
            📊 Game Statistics
          </h1>
          <p className="text-gray-400 text-sm">
            Real-time statistics from the Dice Mania platform
          </p>
        </header>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
             
              <div
                className="bg-white border-3 border-black px-8 py-4 inline-block mb-6"
                style={{ boxShadow: "3px 3px black, 5px 5px white" }}
              >
                <h2 className="text-2xl font-bold text-black uppercase tracking-wider">
                  Loading Stats...
                </h2>
              </div>
              {/* Loading Bar */}
              <div
                className="w-64 mx-auto bg-white border-2 border-black p-1"
                style={{ boxShadow: "2px 2px black" }}
              >
                <div
                  className="h-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400"
                  style={{
                    width: "100%",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s ease-in-out infinite",
                  }}
                ></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div
                className="bg-white border-3 border-black px-8 py-4 inline-block"
                style={{ boxShadow: "3px 3px black, 5px 5px white" }}
              >
                <h2 className="text-xl font-bold text-red-600 uppercase">
                  ⚠️ Error Loading Stats
                </h2>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
                <button
                  onClick={fetchStats}
                  className="mt-4 retro rbtn-small text-xs"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : (
          stats && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon="👥"
                  color="text-blue-600"
                  description="Unique players registered"
                />
                <StatCard
                  title="Total Bets Placed"
                  value={stats.totalBetsPlaced}
                  icon="🎯"
                  color="text-green-600"
                  description="All bets placed across pools"
                />
                <StatCard
                  title="Total Pools Created"
                  value={stats.totalPoolsCreated}
                  icon="🏊"
                  color="text-purple-600"
                  description="Number of pools created"
                />
                <StatCard
                  title="Total Points Awarded"
                  value={stats.totalPointsAwarded}
                  icon="⭐"
                  color="text-yellow-600"
                  description="Points distributed to players"
                />
              </div>

              {/* Additional Info Section */}
              <div className="mt-8">
                <div
                  className="border-3 bg-blue-50 border-black p-6"
                  style={{ boxShadow: "3px 3px black, 5px 5px white" }}
                >
                  <h2 className="text-xl font-bold text-black mb-4 uppercase">
                    📈 Platform Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold text-black">Average Bets per User:</span>
                      </p>
                      <div className="text-2xl font-bold text-black">
                        {stats.totalUsers !== "0" ? (
                          <AnimatedNumbers
                            transitions={(index) => ({
                              type: "spring",
                              duration: index + 0.3,
                            })}
                            animateToNumber={parseFloat(
                              (
                                parseInt(stats.totalBetsPlaced) /
                                parseInt(stats.totalUsers)
                              ).toFixed(2)
                            )}
                            fontStyle={{
                              fontSize: 28,
                              fontWeight: "bold",
                            }}
                            locale="en-US"
                          />
                        ) : (
                          "0.00"
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold text-black">Average Points per User:</span>
                      </p>
                      <div className="text-2xl font-bold text-black">
                        {stats.totalUsers !== "0" ? (
                          <AnimatedNumbers
                            transitions={(index) => ({
                              type: "spring",
                              duration: index + 0.3,
                            })}
                            animateToNumber={parseFloat(
                              (
                                parseInt(stats.totalPointsAwarded) /
                                parseInt(stats.totalUsers)
                              ).toFixed(2)
                            )}
                            fontStyle={{
                              fontSize: 28,
                              fontWeight: "bold",
                            }}
                            locale="en-US"
                          />
                        ) : (
                          "0.00"
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold text-black">Bets per Pool:</span>
                      </p>
                      <div className="text-2xl font-bold text-black">
                        {stats.totalPoolsCreated !== "0" ? (
                          <AnimatedNumbers
                            transitions={(index) => ({
                              type: "spring",
                              duration: index + 0.3,
                            })}
                            animateToNumber={parseFloat(
                              (
                                parseInt(stats.totalBetsPlaced) /
                                parseInt(stats.totalPoolsCreated)
                              ).toFixed(2)
                            )}
                            fontStyle={{
                              fontSize: 28,
                              fontWeight: "bold",
                            }}
                            locale="en-US"
                          />
                        ) : (
                          "0.00"
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold text-black">Points per Bet:</span>
                      </p>
                      <div className="text-2xl font-bold text-black">
                        {stats.totalBetsPlaced !== "0" ? (
                          <AnimatedNumbers
                            transitions={(index) => ({
                              type: "spring",
                              duration: index + 0.3,
                            })}
                            animateToNumber={parseFloat(
                              (
                                parseInt(stats.totalPointsAwarded) /
                                parseInt(stats.totalBetsPlaced)
                              ).toFixed(2)
                            )}
                            fontStyle={{
                              fontSize: 28,
                              fontWeight: "bold",
                            }}
                            locale="en-US"
                          />
                        ) : (
                          "0.00"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={fetchStats}
                  className="retro rbtn-small text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Refreshing..." : "🔄 Refresh Stats"}
                </button>
              </div>
            </>
          )
        )}
      </div>
    </PageTransition>
  );
}
