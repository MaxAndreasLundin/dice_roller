import { useState, useCallback, useEffect } from 'react';

function App() {
  const [dices, setDices] = useState(8);
  const [again, setAgain] = useState(10);
  const [rote, setRote] = useState(false);
  const [againEnabled, setAgainEnabled] = useState(true);
  const [result, setResult] = useState(0);
  const [chance, setChance] = useState(0);
  const [expected, setExpected] = useState(0);
  const [willpowerSuccesses, setWillpowerSuccesses] = useState<number | null>(null);
  const [justRolled, setJustRolled] = useState(false);

  const rollDice = useCallback((diceCount: number): number => {
    let successes = 0;
    for (let i = 0; i < diceCount; i++) {
      let roll = Math.floor(Math.random() * 10) + 1;
      if (roll >= 8) successes++;
      
      if (againEnabled && roll >= again) {
        while (roll >= again) {
          roll = Math.floor(Math.random() * 10) + 1;
          if (roll >= 8) successes++;
        }
      }
    }
    return successes;
  }, [again, againEnabled]);

  const handleRoll = useCallback(() => {
    let successes = rollDice(dices);
    
    if (rote) {
      const failedDice = dices - successes;
      successes += rollDice(failedDice);
    }
    
    setResult(successes);
    setWillpowerSuccesses(null);
    setJustRolled(true);
  }, [dices, rote, rollDice]);

  const handleWillpower = useCallback(() => {
    const newWillpowerSuccesses = rollDice(3);
    setWillpowerSuccesses(newWillpowerSuccesses);
    setResult(prevResult => prevResult + newWillpowerSuccesses);
    setJustRolled(true);
  }, [rollDice]);

  const calculateProbabilities = useCallback(() => {
    const baseSuccessProbability = 3 / 10; // Probability of rolling 8, 9, or 10
    let effectiveSuccessProbability = baseSuccessProbability;
  
    if (againEnabled) {
      const againProbability = (11 - again) / 10;
      effectiveSuccessProbability = baseSuccessProbability + (1 - baseSuccessProbability) * againProbability * (1 / (1 - againProbability));
    }
  
    let chanceOfSuccess;
    let expectedSuccesses;
  
    if (rote) {
      // For rote quality, we calculate the chance of failing twice
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

  const handleClear = () => {
    setResult(0);
    setWillpowerSuccesses(null);
  };

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
            className={`px-4 py-2 rounded transition-colors ${willpowerSuccesses === null ? 'bg-[#1a1a1a] hover:bg-[#2a2a2a]' : 'bg-gray-600 cursor-not-allowed'}`}
            disabled={willpowerSuccesses !== null}
          >
            Willpower
          </button>
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div className={`text-center text-9xl font-bold transition-transform duration-300 ${justRolled ? 'scale-110' : 'scale-100'}`}>
          {result}
        </div>
      </div>
      {willpowerSuccesses !== null && (
        <div className="text-center mt-2">
          (Including {willpowerSuccesses} from Willpower)
        </div>
      )}
    </div>
  );
}

export default App;