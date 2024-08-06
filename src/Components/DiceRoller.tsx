import { useState, useCallback, useEffect } from "react";

// Custom types
type DiceRollResult = {
  successes: number;
  willpowerSuccesses: number | null;
};

// Constants
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
  const [result, setResult] = useState<DiceRollResult>({
    successes: 0,
    willpowerSuccesses: null,
  });
  const [chance, setChance] = useState<number>(0);
  const [expected, setExpected] = useState<number>(0);
  const [justRolled, setJustRolled] = useState<boolean>(false);

  const handleSetDices = (value: number) => {
    setDices(Math.max(0, value));
  };

  const handleSetAgain = (value: number) => {
    setAgain(Math.min(10, Math.max(5, value)));
  };

  const rollSingleDie = useCallback(
    (againValue: number, isRote: boolean): number => {
      const roll = rollDie();
      if (roll < MIN_SUCCESS) {
        if (isRote) {
          return rollSingleDie(againValue, false);
        }
        return 0;
      }

      let successes = 1;
      if (againEnabled && roll >= againValue) {
        successes += rollSingleDie(againValue, false);
      }
      return successes;
    },
    [againEnabled]
  );

  const rollDice = useCallback(
    (diceCount: number): number => {
      let successes = 0;
      for (let i = 0; i < diceCount; i++) {
        successes += rollSingleDie(again, rote);
      }
      return successes;
    },
    [again, rote, rollSingleDie]
  );

  const handleRoll = useCallback((): void => {
    const successes = rollDice(dices);
    setResult({ successes, willpowerSuccesses: null });
    setJustRolled(true);
  }, [dices, rollDice]);

  const handleWillpower = useCallback((): void => {
    const willpowerSuccesses = rollDice(WILLPOWER_DICE);
    setResult((prevResult) => ({
      successes: prevResult.successes + willpowerSuccesses,
      willpowerSuccesses,
    }));
    setJustRolled(true);
  }, [rollDice]);

  const calculateExpectedSingle = useCallback(
    (againValue: number, isRote: boolean): number => {
      if (isRote) {
        const rerollArea = 7;
        const againArea = DICE_SIDES - againValue + 1;
        const onlyArea = DICE_SIDES - rerollArea - againArea;
        const rerollValue = calculateExpectedSingle(againValue, false);
        const againSuccesses = 1 + calculateExpectedSingle(againValue, false);
        const onlyValue = 1;
        return (
          (rerollValue * rerollArea +
            againSuccesses * againArea +
            onlyValue * onlyArea) /
          DICE_SIDES
        );
      }
      if (againValue >= 11 || !againEnabled) {
        return 3 / DICE_SIDES;
      }
      return 3 / (againValue - 1);
    },
    [againEnabled]
  );

  const calculateProbabilities = useCallback((): void => {
    const expectedSingle = calculateExpectedSingle(again, rote);
    const expectedTotal = expectedSingle * dices;
    setExpected(isNaN(expectedTotal) ? 0 : Math.round(expectedTotal * 10) / 10);

    const chanceOfFailure = Math.pow(0.7, rote ? 2 * dices : dices);
    const chanceOfSuccess = 1 - chanceOfFailure;
    setChance(isNaN(chanceOfSuccess) ? 0 : Math.round(chanceOfSuccess * 100));
  }, [dices, again, rote, calculateExpectedSingle]);

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
    dices,
    setDices: handleSetDices,
    again,
    setAgain: handleSetAgain,
    rote,
    setRote,
    againEnabled,
    setAgainEnabled,
    result,
    chance,
    expected,
    justRolled,
    handleRoll,
    handleWillpower,
    handleClear,
  };
};

export function DiceRoller(): JSX.Element {
  const {
    dices,
    setDices,
    again,
    setAgain,
    rote,
    setRote,
    againEnabled,
    setAgainEnabled,
    result,
    chance,
    expected,
    justRolled,
    handleRoll,
    handleWillpower,
    handleClear,
  } = useDiceRoller();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-md rounded-xl p-8 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5"></div>
        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col">
              <label htmlFor="dices" className="text-2xl mb-2">
                Dices
              </label>
              <input
                id="dices"
                type="number"
                value={dices}
                onChange={(e) => setDices(Number(e.target.value))}
                min="0"
                className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 text-3xl"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="again" className="text-2xl mb-2">
                Again
              </label>
              <input
                id="again"
                type="number"
                value={again}
                onChange={(e) => setAgain(Number(e.target.value))}
                min="5"
                max="10"
                disabled={!againEnabled}
                className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 text-3xl"
              />
            </div>
          </div>
          <div className="mb-8 space-y-4">
            <label className="flex items-center text-xl">
              <input
                type="checkbox"
                checked={rote}
                onChange={(e) => setRote(e.target.checked)}
                className="mr-3 w-6 h-6"
              />
              Rote
            </label>
            <label className="flex items-center text-xl">
              <input
                type="checkbox"
                checked={againEnabled}
                onChange={(e) => setAgainEnabled(e.target.checked)}
                className="mr-3 w-6 h-6"
              />
              Enable "Again" rolls
            </label>
          </div>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col">
              <label className="text-2xl mb-2">Chance</label>
              <div className="bg-[#1a1a1a] px-4 py-3 rounded-lg border border-gray-600 text-3xl">
                {chance}%
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-2xl mb-2">Expected</label>
              <div className="bg-[#1a1a1a] px-4 py-3 rounded-lg border border-gray-600 text-3xl">
                {expected}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 mb-12">
            <button
              onClick={handleClear}
              className="bg-[#1a1a1a] hover:bg-[#2a2a2a] px-6 py-4 rounded-lg transition-colors text-2xl"
            >
              Clear
            </button>
            <button
              onClick={handleRoll}
              className="bg-[#1a1a1a] hover:bg-[#2a2a2a] px-6 py-4 rounded-lg transition-colors text-2xl"
            >
              Roll
            </button>
            <button
              onClick={handleWillpower}
              className={`px-6 py-4 rounded-lg transition-colors text-2xl ${
                result.willpowerSuccesses === null
                  ? "bg-[#1a1a1a] hover:bg-[#2a2a2a]"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
              disabled={result.willpowerSuccesses !== null}
            >
              Willpower
            </button>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`text-9xl md:text-[12rem] lg:text-[16rem] font-bold transition-transform duration-300 ${
                justRolled ? "scale-110" : "scale-100"
              }`}
            >
              {result.successes}
            </div>
            <div className="h-16 flex items-center justify-center">
              {result.willpowerSuccesses !== null && (
                <div className="text-center text-3xl">
                  ( {result.willpowerSuccesses} from Willpower)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
