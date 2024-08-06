import { useState, useEffect } from "react";

export type Preset = {
  id: string;
  name: string;
  dices: number;
  again: number;
  rote: boolean;
  againEnabled: boolean;
};

export const usePresets = () => {
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    const storedPresets = localStorage.getItem("diceRollerPresets");
    if (storedPresets) {
      setPresets(JSON.parse(storedPresets));
    }
  }, []);

  const savePresets = (newPresets: Preset[]) => {
    setPresets(newPresets);
    localStorage.setItem("diceRollerPresets", JSON.stringify(newPresets));
  };

  const addPreset = (preset: Omit<Preset, "id">) => {
    const newPreset = { ...preset, id: Date.now().toString() };
    savePresets([...presets, newPreset]);
  };

  const updatePreset = (id: string, updatedPreset: Partial<Preset>) => {
    const newPresets = presets.map((preset) =>
      preset.id === id ? { ...preset, ...updatedPreset } : preset
    );
    savePresets(newPresets);
  };

  const deletePreset = (id: string) => {
    savePresets(presets.filter((preset) => preset.id !== id));
  };

  return { presets, addPreset, updatePreset, deletePreset };
};
