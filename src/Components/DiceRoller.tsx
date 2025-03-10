import { useDiceRoller } from "../hooks/useDiceRoller";
import { usePresetManager } from "../hooks/usePresetManager";
import { PresetManager } from "./PresetManager";
import { Preset } from "../hooks/usePresets";

export function DiceRoller(): JSX.Element {
  const {
    dices,
    handleSetDices,
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
    isChanceDice,
  } = useDiceRoller();

  const {
    presets,
    addPreset,
    updatePreset,
    deletePreset,
    activePresetId,
    handleLoadPreset,
    clearActivePreset,
    reorderPresets,
  } = usePresetManager({ dices, again, rote, againEnabled });

  const handleSetDicesWrapper = (newDices: number) => {
    handleSetDices(newDices);
    clearActivePreset();
  };

  const handleSetAgainWrapper = (newAgain: number) => {
    setAgain(newAgain);
    clearActivePreset();
  };

  const handleSetRoteWrapper = (newRote: boolean) => {
    setRote(newRote);
    clearActivePreset();
  };

  const handleSetAgainEnabledWrapper = (newAgainEnabled: boolean) => {
    setAgainEnabled(newAgainEnabled);
    clearActivePreset();
  };

  const handlePresetLoad = (preset: Preset) => {
    handleLoadPreset(preset);
    handleSetDices(preset.dices);
    setAgain(preset.again);
    setRote(preset.rote);
    setAgainEnabled(preset.againEnabled);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row">
      <div className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-md rounded-xl p-8 shadow-xl overflow-hidden flex-grow">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5"></div>
        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col">
              <label htmlFor="dices" className="text-2xl mb-2">
                Dices
              </label>
              <div className="number-input-wrapper">
                <input
                  id="dices"
                  type="number"
                  value={dices}
                  onChange={(e) =>
                    handleSetDicesWrapper(Number(e.target.value))
                  }
                  min="0"
                  className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 text-3xl number-input"
                />
                <div className="number-input-buttons">
                  <button
                    className="number-input-button"
                    onClick={() => handleSetDicesWrapper(dices + 1)}
                  >
                    ▲
                  </button>
                  <button
                    className="number-input-button"
                    onClick={() =>
                      handleSetDicesWrapper(Math.max(0, dices - 1))
                    }
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="again" className="text-2xl mb-2">
                Again
              </label>
              <div className="number-input-wrapper">
                <input
                  id="again"
                  type="number"
                  value={again}
                  onChange={(e) =>
                    handleSetAgainWrapper(Number(e.target.value))
                  }
                  min="5"
                  max="10"
                  disabled={!againEnabled || isChanceDice}
                  className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 text-3xl number-input"
                />
                <div className="number-input-buttons">
                  <button
                    className="number-input-button"
                    onClick={() =>
                      handleSetAgainWrapper(Math.min(10, again + 1))
                    }
                    disabled={!againEnabled || isChanceDice}
                  >
                    ▲
                  </button>
                  <button
                    className="number-input-button"
                    onClick={() =>
                      handleSetAgainWrapper(Math.max(5, again - 1))
                    }
                    disabled={!againEnabled || isChanceDice}
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-8 space-y-4">
            <label className="flex items-center text-xl">
              <input
                type="checkbox"
                checked={rote}
                onChange={(e) => handleSetRoteWrapper(e.target.checked)}
                className="mr-3 w-6 h-6"
                disabled={isChanceDice}
              />
              Rote
            </label>
            <label className="flex items-center text-xl">
              <input
                type="checkbox"
                checked={againEnabled}
                onChange={(e) => handleSetAgainEnabledWrapper(e.target.checked)}
                className="mr-3 w-6 h-6"
                disabled={isChanceDice}
              />
              Enable "Again" rolls
            </label>
          </div>
          {isChanceDice && (
            <div className="mb-4 text-yellow-400 text-xl">
              Chance Die: Only 10 counts as a success
            </div>
          )}
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
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-8 mb-12">
            <button
              onClick={handleClear}
              className="flex items-center justify-center bg-[#1a1a1a] hover:bg-[#2a2a2a] px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-lg transition-colors text-sm sm:text-base md:text-lg lg:text-2xl"
            >
              Clear
            </button>
            <button
              onClick={handleRoll}
              className="flex items-center justify-center bg-[#1a1a1a] hover:bg-[#2a2a2a] px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-lg transition-colors text-sm sm:text-base md:text-lg lg:text-2xl"
            >
              Roll
            </button>
            <button
              onClick={handleWillpower}
              className={`flex items-center justify-center px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-lg transition-colors text-sm sm:text-base md:text-lg lg:text-2xl ${
                result.willpowerSuccesses === null && !isChanceDice
                  ? "bg-[#1a1a1a] hover:bg-[#2a2a2a]"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
              disabled={result.willpowerSuccesses !== null || isChanceDice}
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
                  {result.willpowerSuccesses} from Willpower
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 px-4 mt-8 lg:mt-0 lg:ml-8">
        <PresetManager
          currentSettings={{ dices, again, rote, againEnabled }}
          presets={presets}
          onAddPreset={addPreset}
          onUpdatePreset={updatePreset}
          onDeletePreset={deletePreset}
          onLoadPreset={handlePresetLoad}
          onReorderPresets={reorderPresets}
          activePresetId={activePresetId}
        />
      </div>
    </div>
  );
}
