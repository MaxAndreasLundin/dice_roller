import { useState, useEffect, useCallback } from "react";
import { Preset, usePresets } from "./usePresets";

type PresetSettings = Omit<Preset, "id" | "name">;

export function usePresetManager(currentSettings: PresetSettings) {
  const { presets, addPreset, updatePreset, deletePreset } = usePresets();
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [lastLoadedSettings, setLastLoadedSettings] =
    useState<PresetSettings | null>(null);

  const handleLoadPreset = useCallback((preset: Preset) => {
    setActivePresetId(preset.id);
    setLastLoadedSettings({
      dices: preset.dices,
      again: preset.again,
      rote: preset.rote,
      againEnabled: preset.againEnabled,
    });
    return preset;
  }, []);

  useEffect(() => {
    if (
      lastLoadedSettings &&
      (currentSettings.dices !== lastLoadedSettings.dices ||
        currentSettings.again !== lastLoadedSettings.again ||
        currentSettings.rote !== lastLoadedSettings.rote ||
        currentSettings.againEnabled !== lastLoadedSettings.againEnabled)
    ) {
      setActivePresetId(null);
    }
  }, [currentSettings, lastLoadedSettings]);

  const clearActivePreset = useCallback(() => {
    setActivePresetId(null);
  }, []);

  return {
    presets,
    addPreset,
    updatePreset,
    deletePreset,
    activePresetId,
    handleLoadPreset,
    clearActivePreset,
  };
}
