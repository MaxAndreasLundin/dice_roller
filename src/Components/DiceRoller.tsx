import { useDiceRoller } from "../hooks/useDiceRoller";
import { Preset, usePresets } from "../hooks/usePresets";
import { PresetManager } from "./PresetManager";

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

  const { presets, addPreset, updatePreset, deletePreset } = usePresets();

  const handleLoadPreset = (preset: Preset) => {
    handleSetDices(preset.dices);
    setAgain(preset.again);
    setRote(preset.rote);
    setAgainEnabled(preset.againEnabled);
  };

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
                onChange={(e) => handleSetDices(Number(e.target.value))}
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
                disabled={!againEnabled || isChanceDice}
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
                disabled={isChanceDice}
              />
              Rote
            </label>
            <label className="flex items-center text-xl">
              <input
                type="checkbox"
                checked={againEnabled}
                onChange={(e) => setAgainEnabled(e.target.checked)}
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
      <div className="w-full lg:w-1/2 px-4">
        <PresetManager
          currentSettings={{ dices, again, rote, againEnabled }}
          presets={presets}
          onAddPreset={addPreset}
          onUpdatePreset={updatePreset}
          onDeletePreset={deletePreset}
          onLoadPreset={handleLoadPreset}
        />
      </div>
    </div>
  );
}
