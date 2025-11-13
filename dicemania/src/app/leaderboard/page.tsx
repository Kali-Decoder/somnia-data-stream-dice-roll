"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Navbar from "@/component/Navbar";
import { PageTransition } from "@/component/PageTransition";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface LeaderboardEntry {
  address: string;
  totalPoolsPlayed: number;
  totalRewards: string;
  points: number;
}

const ITEMS_PER_PAGE = 5;

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { address } = useAccount();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLeaderboard(leaderboard);
    } else {
      const filtered = leaderboard.filter((entry) =>
        entry.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLeaderboard(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, leaderboard]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call to get leaderboard data
      // For now, using mock data structure
      const response = await fetch("/api/leaderboard");
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        setTotalPlayers(data.totalPlayers || 0);
      } else {
        // Mock data for development - 10 players
        const mockData: LeaderboardEntry[] = [
          {
            address: "0x1234567890123456789012345678901234567890",
            totalPoolsPlayed: 25,
            totalRewards: "5.2",
            points: 2250,
          },
          {
            address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            totalPoolsPlayed: 22,
            totalRewards: "4.8",
            points: 1980,
          },
          {
            address: "0x9876543210987654321098765432109876543210",
            totalPoolsPlayed: 20,
            totalRewards: "4.2",
            points: 1750,
          },
          {
            address: "0x1111111111111111111111111111111111111111",
            totalPoolsPlayed: 18,
            totalRewards: "3.8",
            points: 1520,
          },
          {
            address: "0x2222222222222222222222222222222222222222",
            totalPoolsPlayed: 15,
            totalRewards: "3.2",
            points: 1350,
          },
          {
            address: "0x3333333333333333333333333333333333333333",
            totalPoolsPlayed: 12,
            totalRewards: "2.5",
            points: 1120,
          },
          {
            address: "0x4444444444444444444444444444444444444444",
            totalPoolsPlayed: 10,
            totalRewards: "2.1",
            points: 980,
          },
          {
            address: "0x5555555555555555555555555555555555555555",
            totalPoolsPlayed: 8,
            totalRewards: "1.8",
            points: 850,
          },
          {
            address: "0x6666666666666666666666666666666666666666",
            totalPoolsPlayed: 6,
            totalRewards: "1.2",
            points: 650,
          },
          {
            address: "0x7777777777777777777777777777777777777777",
            totalPoolsPlayed: 4,
            totalRewards: "0.8",
            points: 450,
          },
        ];
        setLeaderboard(mockData);
        setTotalPlayers(mockData.length);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      setLeaderboard([]);
      setTotalPlayers(0);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankColor = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-400 to-yellow-300 text-black"; // Gold for 1st
    if (index === 1) return "bg-gradient-to-r from-gray-300 to-gray-200 text-black"; // Silver for 2nd
    if (index === 2) return "bg-gradient-to-r from-orange-300 to-orange-200 text-black"; // Bronze for 3rd
    return "bg-white text-black"; // Default
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredLeaderboard.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLeaderboard = filteredLeaderboard.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <PageTransition>
      <Navbar />
      <div className="w-[90%] max-w-6xl mt-28 mx-auto bg-[#000618] min-h-screen pb-10">
        {/* Header Section */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white uppercase tracking-wider">
            🏆 Leaderboard
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="retro rbtn-small text-sm">
              <span className="font-bold text-lg">{totalPlayers}</span> Players Enrolled
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <div className="mb-8 flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={20} />
            <input
              type="text"
              placeholder="Search by address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border-3 border-black text-black placeholder-gray-500 focus:outline-none retro text-sm"
              style={{ boxShadow: "3px 3px black, 5px 5px white" }}
            />
          </div>
        </div>

        {/* Leaderboard Table */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <div className="relative mb-8 inline-block">
                {/* Animated Trophy */}
                <div className="inline-block animate-bounce text-6xl mb-4">
                  🏆
                </div>
                {/* Spinning Dice */}
                <div className="absolute -top-2 -left-8 animate-spin text-3xl" style={{ animationDuration: '2s' }}>
                  🎲
                </div>
                <div className="absolute -top-2 -right-8 animate-spin text-3xl" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
                  🎲
                </div>
              </div>
              {/* Loading Text with Retro Style */}
              <div className="bg-white border-3 border-black px-8 py-4 inline-block mb-6" style={{ boxShadow: "3px 3px black, 5px 5px white" }}>
                <h2 className="text-2xl font-bold text-black uppercase tracking-wider">
                  Loading Leaderboard...
                </h2>
              </div>
              {/* Loading Bar */}
              <div className="w-64 mx-auto bg-white border-2 border-black p-1" style={{ boxShadow: "2px 2px black" }}>
                <div 
                  className="h-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400" 
                  style={{ 
                    width: '100%',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s ease-in-out infinite'
                  }}
                ></div>
              </div>
            </div>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <h2 className="text-xl text-white uppercase">
              {searchQuery ? "No players found" : "No players yet"}
            </h2>
          </div>
        ) : (
          <div className="bg-white border-3 border-black overflow-hidden" style={{ boxShadow: "3px 3px black, 5px 5px white" }}>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black bg-gray-100">
                  <th className="px-4 py-4 text-left text-sm font-semibold text-black">Rank</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-black">Address</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-black">Pools Played</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-black">Total Rewards</th>
                  <th className="px-4 py-4 text-right text-sm font-semibold text-black">Points</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeaderboard.map((entry, index) => {
                  const originalIndex = leaderboard.findIndex(
                    (e) => e.address === entry.address
                  );
                  const rank = originalIndex + 1;
                  const isTopThree = rank <= 3;
                  const isCurrentUser = entry.address.toLowerCase() === address?.toLowerCase();
                  
                  return (
                    <tr
                      key={entry.address}
                      className={`border-b border-black ${
                        isTopThree ? getRankColor(originalIndex) : "bg-white"
                      } ${isCurrentUser ? "ring-2 ring-blue-500" : ""} hover:bg-gray-50 transition-colors`}
                    >
                      <td className="px-4 py-4 text-sm font-bold">
                        {isTopThree ? (
                          <span className="text-2xl mr-2">
                            {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                          </span>
                        ) :  <span className={isTopThree ? "text-lg" : "text-gray-600"}>#{rank}</span>}
                       
                      </td>
                      <td className="px-4 py-4 text-sm font-mono font-bold text-black">
                        {formatAddress(entry.address)}
                        {isCurrentUser && (
                          <span className="ml-2 text-blue-600 text-xs font-normal">(You)</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-center font-bold text-black">
                        {entry.totalPoolsPlayed}
                      </td>
                      <td className="px-4 py-4 text-sm text-center font-bold text-green-600">
                        {entry.totalRewards} STT
                      </td>
                      <td className="px-4 py-4 text-sm text-right font-bold text-black">
                        {entry.points.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredLeaderboard.length > 0 && (
          <div className="mt-8">
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="retro rbtn-small text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
    
                  Prev
                </button>
                
                {getPageNumbers().map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-2 text-xs text-white">
                        ...
                      </span>
                    );
                  }
                  
                  const pageNum = page as number;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`retro rbtn-small text-xs ${
                        currentPage === pageNum
                          ? "bg-blue-500 text-white"
                          : ""
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="retro rbtn-small text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
           
                </button>
              </div>
            )}

            {/* Page info */}
            <div className="text-center text-xs text-white">
              Showing {startIndex + 1} - {Math.min(endIndex, filteredLeaderboard.length)} of {filteredLeaderboard.length} players
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

