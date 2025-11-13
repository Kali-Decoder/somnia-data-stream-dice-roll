"use client";
import { useEffect, useRef, useState } from "react";
import PlayersBoard from "./PlayersBoard";
import PoolDetail from "./PoolDetail";

interface PoolComponentProps {
  singlePoolDetail: Array<{
    poolId: bigint | number;
    result: bigint | number;
    bets?: any[];
    [key: string]: any;
  }>;
  onRefresh?: () => void;
}

const PoolComponent = ({ singlePoolDetail, onRefresh }: PoolComponentProps) => {
  const [diceValue, setDiceValue] = useState<number>(1);
  const [finalValue, setFinalValue] = useState<number | null>(null);

  const diceRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start infinite rolling
  useEffect(() => {
    const resultValue = singlePoolDetail?.[0]?.result;
    const resultNum = resultValue ? Number(resultValue) : 0;
    console.log("Result Value:", resultNum);
  
    if (resultNum > 0) {
      setFinalValue(resultNum);
      setDiceValue(resultNum);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else if (finalValue === null) {
      intervalRef.current = setInterval(() => {
        const randomValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(randomValue);
      }, 100); // Smooth rolling speed
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setDiceValue(finalValue); // show final result
    }
  
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [finalValue, singlePoolDetail]);
  
  // Apply dice class for animation
  useEffect(() => {
    const dice = diceRef.current;
    if (!dice) return;
  
    // Remove previous dice show classes
    for (let i = 1; i <= 6; i++) {
      dice.classList.remove(`show-${i}`);
    }
  
    // Add the class corresponding to dice value
    dice.classList.add(`show-${diceValue}`);
  }, [diceValue]);
  return (
    <>
      {singlePoolDetail && singlePoolDetail.length > 0 ? (
        <>
          <div className="flex justify-between items-start w-full p-6 gap-6">
            {/* Left: Pool Details - 35% */}
            <div className="w-[35%]">
              <PoolDetail singlePoolDetail={singlePoolDetail} onRefresh={onRefresh} />
            </div>

            {/* Center: Dice Roll - 30% */}
            <div className="w-[30%] flex justify-center items-center">
              <div className="game w-24 h-24">
                <div className="container">
                  <div id="dice1" className="dice dice-one" ref={diceRef}>
                    <div id="dice-one-side-one" className="side one">
                      <div className="dot one-1"></div>
                    </div>
                    <div id="dice-one-side-two" className="side two">
                      <div className="dot two-1"></div>
                      <div className="dot two-2"></div>
                    </div>
                    <div id="dice-one-side-three" className="side three">
                      <div className="dot three-1"></div>
                      <div className="dot three-2"></div>
                      <div className="dot three-3"></div>
                    </div>
                    <div id="dice-one-side-four" className="side four">
                      <div className="dot four-1"></div>
                      <div className="dot four-2"></div>
                      <div className="dot four-3"></div>
                      <div className="dot four-4"></div>
                    </div>
                    <div id="dice-one-side-five" className="side five">
                      <div className="dot five-1"></div>
                      <div className="dot five-2"></div>
                      <div className="dot five-3"></div>
                      <div className="dot five-4"></div>
                      <div className="dot five-5"></div>
                    </div>
                    <div id="dice-one-side-six" className="side six">
                      <div className="dot six-1"></div>
                      <div className="dot six-2"></div>
                      <div className="dot six-3"></div>
                      <div className="dot six-4"></div>
                      <div className="dot six-5"></div>
                      <div className="dot six-6"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Players Board - 35% */}
            <div className="w-[35%]">
              <PlayersBoard players={singlePoolDetail?.[0]?.bets || []} />
            </div>
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default PoolComponent;
