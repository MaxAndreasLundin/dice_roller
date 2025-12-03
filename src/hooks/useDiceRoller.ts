import { useCallback, useEffect, useState, useMemo } from "react";

type DiceRollResult = {
  successes: number;
  willpowerSuccesses: number | null;
};

const DICE_SIDES = 10;
const MIN_SUCCESS = 8;
const WILLPOWER_DICE = 3;

const rollDie = (): number => Math.floor(Math.random() * DICE_SIDES) + 1;

export const useDiceRoller = () => {
  const [dices, setDices] = useState<number>(8);
  const [again, setAgain] = useState<number>(10);
  const [rote, setRote] = useState<boolean>(false);
  const [againEnabled, setAgainEnabled] = useState<boolean>(true);
  const [result, setResult] = useState<DiceRollResult>({
    successes: 0,
    willpowerSuccesses: null,
  });
  const [justRolled, setJustRolled] = useState<boolean>(false);
  const [isChanceDice, setIsChanceDice] = useState<boolean>(false);

  const handleSetDices = (value: number) => {
    const newDiceCount = Math.max(0, value);
    const wasChanceDice = dices === 0; // Check if it was a chance die before this change

    setDices(newDiceCount);

    if (newDiceCount === 0) {
      setIsChanceDice(true);
      setAgainEnabled(false);
    } else {
      setIsChanceDice(false);
      // Enable "Again" rolls if coming from a chance die situation
      if (wasChanceDice) {
        setAgainEnabled(true);
      }
    }
  };

  const handleSetAgain = (value: number) => {
    setAgain(Math.min(10, Math.max(5, value)));
  };

  const rollSingleDie = useCallback(
    (againValue: number, isRote: boolean): number => {
      const roll = rollDie();
      if (isChanceDice) {
        return roll === 10 ? 1 : 0;
      }
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
    [againEnabled, isChanceDice]
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
    const successes = isChanceDice ? rollSingleDie(10, false) : rollDice(dices);
    setResult({ successes, willpowerSuccesses: null });
    setJustRolled(true);
  }, [dices, rollDice, isChanceDice, rollSingleDie]);

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
      if (isChanceDice) {
        return 1 / DICE_SIDES;
      }
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
    [againEnabled, isChanceDice]
  );

  // Memoize expensive probability calculations
  const { expected, chance } = useMemo(() => {
    if (isChanceDice) {
      return { expected: 0.1, chance: 10 };
    }
    const expectedSingle = calculateExpectedSingle(again, rote);
    const expectedTotal = expectedSingle * dices;
    const expectedValue = isNaN(expectedTotal)
      ? 0
      : Math.round(expectedTotal * 10) / 10;

    const chanceOfFailure = Math.pow(0.7, rote ? 2 * dices : dices);
    const chanceOfSuccess = 1 - chanceOfFailure;
    const chanceValue = isNaN(chanceOfSuccess)
      ? 0
      : Math.round(chanceOfSuccess * 100);

    return { expected: expectedValue, chance: chanceValue };
  }, [dices, again, rote, againEnabled, calculateExpectedSingle, isChanceDice]);

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
    isChanceDice,
    handleSetDices,
  };
};
