import { useState, useCallback, useEffect } from 'react';

// Custom types
type DiceRollResult = {
  successes: number;
  willpowerSuccesses: number | null;
};

// Constants
const BASE_SUCCESS_PROBABILITY = 3 / 10;
const DICE_SIDES = 10;
const MIN_SUCCESS = 8;
const WILLPOWER_DICE = 3;

// Utility functions
const rollDie = (): number => Math.floor(Math.random() * DICE_SIDES) + 1;

const useDiceRoller = () => {
  const [dices, setDices] = useState<number>(8);
  const [again, setAgain] = useState<number>(10);
  const [rote, setRote] = useState<boolean>(false);
  const [againEnabled, setAgainEnabled] = useState<boolean>(true);
  const [result, setResult] = useState<DiceRollResult>({ successes: 0, willpowerSuccesses: null });
  const [chance, setChance] = useState<number>(0);
  const [expected, setExpected] = useState<number>(0);
  const [justRolled, setJustRolled] = useState<boolean>(false);

  const rollDice = useCallback((diceCount: number): number => {
    let successes = 0;
    for (let i = 0; i < diceCount; i++) {
      let roll = rollDie();
      if (roll >= MIN_SUCCESS) successes++;
      
      if (againEnabled && roll >= again) {
        while (roll >= again) {
          roll = rollDie();
          if (roll >= MIN_SUCCESS) successes++;
        }
      }
    }
    return successes;
  }, [again, againEnabled]);

  const handleRoll = useCallback((): void => {
    let successes = rollDice(dices);
    
    if (rote) {
      const failedDice = dices - successes;
      successes += rollDice(failedDice);
    }
    
    setResult({ successes, willpowerSuccesses: null });
    setJustRolled(true);
  }, [dices, rote, rollDice]);

  const handleWillpower = useCallback((): void => {
    const willpowerSuccesses = rollDice(WILLPOWER_DICE);
    setResult(prevResult => ({
      successes: prevResult.successes + willpowerSuccesses,
      willpowerSuccesses
    }));
    setJustRolled(true);
  }, [rollDice]);

  const calculateProbabilities = useCallback((): void => {
    let effectiveSuccessProbability = BASE_SUCCESS_PROBABILITY;
  
    if (againEnabled) {
      const againProbability = (DICE_SIDES + 1 - again) / DICE_SIDES;
      effectiveSuccessProbability = BASE_SUCCESS_PROBABILITY + (1 - BASE_SUCCESS_PROBABILITY) * againProbability * (1 / (1 - againProbability));
    }
  
    let chanceOfSuccess: number;
    let expectedSuccesses: number;
  
    if (rote) {
      chanceOfSuccess = 1 - Math.pow(1 - effectiveSuccessProbability, 2 * dices);
      expectedSuccesses = dices * (effectiveSuccessProbability + (1 - effectiveSuccessProbability) * effectiveSuccessProbability);
    } else {
      chanceOfSuccess = 1 - Math.pow(1 - effectiveSuccessProbability, dices);
      expectedSuccesses = dices * effectiveSuccessProbability;
    }
  
    setChance(Math.round(chanceOfSuccess * 100));
    setExpected(Math.round(expectedSuccesses * 10) / 10);
  }, [dices, again, rote, againEnabled]);

  useEffect(() => {
    calculateProbabilities();
  }, [dices, again, rote, againEnabled, calculateProbabilities]);

  useEffect(() => {
    if (justRolled) {
      const timer = setTimeout(() => setJustRolled(false), 300);
      return () => clearTimeout(timer);
    }
  }, [justRolled]);

  const handleClear = (): void => {
    setResult({ successes: 0, willpowerSuccesses: null });
  };

  return {
    dices, setDices,
    again, setAgain,
    rote, setRote,
    againEnabled, setAgainEnabled,
    result, chance, expected,
    justRolled,
    handleRoll, handleWillpower, handleClear
  };
};

export function DiceRoller(): JSX.Element {
    const {
      dices, setDices,
      again, setAgain,
      rote, setRote,
      againEnabled, setAgainEnabled,
      result, chance, expected,
      justRolled,
      handleRoll, handleWillpower, handleClear
    } = useDiceRoller();
  
    return (
      <div className="min-h-screen bg-[#242424] text-white p-4 flex flex-col">
        <div className="w-full max-w-lg mx-auto">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="dices" className="block mb-1">Dices:</label>
              <input
                id="dices"
                type="number"
                value={dices}
                onChange={(e) => setDices(Number(e.target.value))}
                className="w-full bg-[#1a1a1a] text-white px-2 py-1 rounded border border-gray-600"
              />
            </div>
            <div>
              <label htmlFor="again" className="block mb-1">Again:</label>
              <input
                id="again"
                type="number"
                value={again}
                onChange={(e) => setAgain(Number(e.target.value))}
                disabled={!againEnabled}
                className="w-full bg-[#1a1a1a] text-white px-2 py-1 rounded border border-gray-600"
              />
            </div>
          </div>
          <div className="mb-4 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rote}
                onChange={(e) => setRote(e.target.checked)}
                className="mr-2"
              />
              Rote
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={againEnabled}
                onChange={(e) => setAgainEnabled(e.target.checked)}
                className="mr-2"
              />
              Enable "Again" rolls
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1">Chance:</label>
              <div className="bg-[#1a1a1a] px-2 py-1 rounded border border-gray-600">{chance}%</div>
            </div>
            <div>
              <label className="block mb-1">Expected:</label>
              <div className="bg-[#1a1a1a] px-2 py-1 rounded border border-gray-600">{expected}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button onClick={handleClear} className="bg-[#1a1a1a] hover:bg-[#2a2a2a] px-4 py-2 rounded transition-colors">Clear</button>
            <button onClick={handleRoll} className="bg-[#1a1a1a] hover:bg-[#2a2a2a] px-4 py-2 rounded transition-colors">Roll</button>
            <button 
              onClick={handleWillpower} 
              className={`px-4 py-2 rounded transition-colors ${result.willpowerSuccesses === null ? 'bg-[#1a1a1a] hover:bg-[#2a2a2a]' : 'bg-gray-600 cursor-not-allowed'}`}
              disabled={result.willpowerSuccesses !== null}
            >
              Willpower
            </button>
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className={`text-center text-9xl font-bold transition-transform duration-300 ${justRolled ? 'scale-110' : 'scale-100'}`}>
            {result.successes}
          </div>
        </div>
        {result.willpowerSuccesses !== null && (
          <div className="text-center mt-2">
            ( {result.willpowerSuccesses} from Willpower)
          </div>
        )}
      </div>
    );
  }