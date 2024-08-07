import { useState, useEffect, useCallback } from "react";
import { Preset, usePresets } from "./usePresets";

type PresetSettings = Omit<Preset, "id" | "name">;

export function usePresetManager(currentSettings: PresetSettings) {
  const { presets, addPreset, updatePreset, deletePreset } = usePresets();
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [lastLoadedSettings, setLastLoadedSettings] =
    useState<PresetSettings | null>(null);
  const [orderedPresetIds, setOrderedPresetIds] = useState<string[]>([]);

  // Load preset order from local storage on initial render
  useEffect(() => {
    const savedOrder = localStorage.getItem("presetOrder");
    if (savedOrder) {
      setOrderedPresetIds(JSON.parse(savedOrder));
    } else {
      setOrderedPresetIds(presets.map((preset) => preset.id));
    }
  }, [presets]);

  // Sort presets based on the ordered IDs
  const sortedPresets = useCallback(() => {
    return orderedPresetIds
      .map((id) => presets.find((preset) => preset.id === id))
      .filter((preset): preset is Preset => preset !== undefined);
  }, [presets, orderedPresetIds]);

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

  const reorderPresets = useCallback((newPresets: Preset[]) => {
    const newOrder = newPresets.map((preset) => preset.id);
    setOrderedPresetIds(newOrder);
    localStorage.setItem("presetOrder", JSON.stringify(newOrder));
  }, []);

  const addPresetWithOrder = useCallback(
    (preset: Omit<Preset, "id">) => {
      const newPreset = addPreset(preset);
      const newOrder = [...orderedPresetIds, newPreset.id];
      setOrderedPresetIds(newOrder);
      localStorage.setItem("presetOrder", JSON.stringify(newOrder));
      return newPreset;
    },
    [orderedPresetIds, addPreset]
  );

  const deletePresetWithOrder = useCallback(
    (id: string) => {
      deletePreset(id);
      const newOrder = orderedPresetIds.filter((presetId) => presetId !== id);
      setOrderedPresetIds(newOrder);
      localStorage.setItem("presetOrder", JSON.stringify(newOrder));
    },
    [orderedPresetIds, deletePreset]
  );

  return {
    presets: sortedPresets(),
    addPreset: addPresetWithOrder,
    updatePreset,
    deletePreset: deletePresetWithOrder,
    activePresetId,
    handleLoadPreset,
    clearActivePreset,
    reorderPresets,
  };
}
