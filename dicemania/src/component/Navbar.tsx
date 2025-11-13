"use client";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import React, { useRef, useEffect } from "react";
import { useAccount, useDisconnect, useSwitchChain, useBalance, useReadContract } from "wagmi";
import { User, Trophy, LogOut, AlertCircle,GitGraph} from "lucide-react";
import { toast } from "react-hot-toast";
import CreatePoolModal from "./CreatePoolModal";
import { DiceManiaAddress } from "@/constant";
import { useNetworkInfo } from "@/hooks/useNetworkInfo";
import { somniaTestnet } from "@/lib/somnia/chain";
import { useContractInfo } from "@/hooks/useContractInfo";
const Navbar = () => {
  const [showCreatePoolModal, setShowCreatePoolModal] = React.useState(false);
  const [showDisconnectDropdown, setShowDisconnectDropdown] = React.useState(false);
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();
  const { isTestnet, networkName, isMounted, tokenSymbol } = useNetworkInfo();
  const { abi, contractAddress } = useContractInfo();
  const dropdownRef = useRef<HTMLDivElement>(null);


  const { data: ownerData, isLoading: isOwnerLoading } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "owner",
  });

  const isOwner = ownerData === address;
  // Get contract balance
  const { data: contractBalance, isLoading: isBalanceLoading } = useBalance({
    address: DiceManiaAddress as `0x${string}`,
  });

  // Get user balance
  const { data: userBalance, isLoading: isUserBalanceLoading } = useBalance({
    address: address,
  });

  // Check if connected to correct network
  const isCorrectNetwork = isMounted && isTestnet;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDisconnectDropdown(false);
      }
    };

    if (showDisconnectDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDisconnectDropdown]);

  const handleDisconnect = () => {
    disconnect();
    setShowDisconnectDropdown(false);
  };

  const handleSwitchChain = async () => {
    try {
      if (switchChain) {
        await switchChain({ chainId: somniaTestnet.id });
        toast.success("Switched to Somnia Testnet");
      }
    } catch (error: any) {
      console.error("Failed to switch chain:", error);
      toast.error(error?.message || "Failed to switch network. Please switch manually in your wallet.");
    }
  };

  return (
    <>
      <nav className="bg-transparent dark:bg-transparent fixed w-full z-20 top-0 start-0  dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <span className="self-center mb-4 text-xl font-semibold whitespace-nowrap dark:text-white">
              🎲 Dice Mania
            </span>
          </Link>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            {/* Show network warning if connected to wrong network */}
            {isConnected && isMounted && !isCorrectNetwork && (
              <button
                onClick={handleSwitchChain}
                className="retro rbtn-small text-xs mr-4 mb-10 flex items-center gap-2"
                style={{ backgroundColor: '#ff4444', color: 'white' }}
              >
                <AlertCircle size={16} />
                Switch to Somnia
              </button>
            )}

            {/* Show network indicator if on correct network */}
            {isConnected && isMounted && isCorrectNetwork && (
              <div className="retro rbtn-small text-xs mr-4 mb-10 flex items-center gap-2" style={{ backgroundColor: '#4CAF50', color: 'white', cursor: 'default' }}>
                <span>🟢</span>
                {networkName}
              </div>
            )}

            {address && isOwner && isCorrectNetwork && (
              <>
                <button
                  onClick={() => setShowCreatePoolModal(true)}
                  className="retro rbtn-small text-xs mr-4 mb-10"
                >
                  Create Pool
                </button>
              </>
            )}
          
            <div className="relative" ref={dropdownRef}>
              {isConnected && address ? (
                <>
                  <button
                    onClick={() => setShowDisconnectDropdown(!showDisconnectDropdown)}
                    className="retro rbtn-small text-xs mr-4 mb-10"
                  >
                    🟢 {address.slice(0, 6) + "..." + address.slice(-4)}
                  </button>
                  {showDisconnectDropdown && (
                    <div className="absolute right-4 top-full mt-0 bg-white border-3 border-black z-50 min-w-[200px]" style={{ boxShadow: "3px 3px black, 5px 5px white" }}>
                      <div className="p-1.5">
                        {/* User Balance Display */}
                        {isCorrectNetwork && address && (
                          <div className="px-2 py-1.5 text-[10px] text-black border-b border-black mb-1.5">
                            <div className="font-semibold text-[11px]">Your Balance</div>
                            <div className="text-[10px] text-gray-600">
                              {isUserBalanceLoading ? (
                                "Loading..."
                              ) : userBalance ? (
                                `${Number(userBalance.formatted).toFixed(4)} ${userBalance.symbol || tokenSymbol}`
                              ) : (
                                "0.0000 STT"
                              )}
                            </div>
                          </div>
                        )}
                        {/* Contract Balance Display */}
                        {isCorrectNetwork && (
                          <div className="px-2 py-1.5 text-[10px] text-black border-b border-black mb-1.5">
                            <div className="font-semibold text-[11px]">Contract Balance</div>
                            <div className="text-[10px] text-gray-600">
                              {isBalanceLoading ? (
                                "Loading..."
                              ) : contractBalance ? (
                                `${Number(contractBalance.formatted).toFixed(4)} ${contractBalance.symbol || tokenSymbol}`
                              ) : (
                                "0.0000 STT"
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href="/profile"
                            onClick={() => setShowDisconnectDropdown(false)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all no-underline"
                            title="Profile"
                          >
                            <User size={16} className="text-black" />
                          </Link>
                          <Link
                            href="/leaderboard"
                            onClick={() => setShowDisconnectDropdown(false)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all no-underline"
                            title="Leaderboard"
                          >
                            <Trophy size={16} className="text-black" />
                          </Link>
                          <Link
                            href="/stats"
                            onClick={() => setShowDisconnectDropdown(false)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all no-underline"
                            title="Stats"
                          >
                            <GitGraph size={16} className="text-black" />
                          </Link>
                          <button
                            onClick={handleDisconnect}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                            title="Disconnect"
                          >
                            <LogOut size={16} className="text-black" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={openConnectModal}
                  className="retro rbtn-small text-sm mr-4 mb-10"
                >
                  Connect Wallet
                </button>
              )}
            </div>
            <button
              data-collapse-toggle="navbar-sticky"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-sticky"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-sticky"
          ></div>
        </div>
      </nav>
      {showCreatePoolModal && (
        <CreatePoolModal setShowCreatePoolModal={setShowCreatePoolModal} />
      )}
    </>
  );
};

export default Navbar;
