import { useState, useEffect } from "react";

export type Preset = {
  id: string;
  name: string;
  dices: number;
  again: number;
  rote: boolean;
  againEnabled: boolean;
};

// Validate that a preset object has the correct structure
const isValidPreset = (obj: any): obj is Preset => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.dices === "number" &&
    typeof obj.again === "number" &&
    typeof obj.rote === "boolean" &&
    typeof obj.againEnabled === "boolean" &&
    obj.dices >= 0 &&
    obj.again >= 5 &&
    obj.again <= 10
  );
};

// Sanitize string input to prevent XSS
const sanitizeString = (str: string): string => {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

export const usePresets = () => {
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    try {
      const storedPresets = localStorage.getItem("diceRollerPresets");
      if (storedPresets) {
        const parsed = JSON.parse(storedPresets);
        // Validate that it's an array and all items are valid presets
        if (
          Array.isArray(parsed) &&
          parsed.every((item) => isValidPreset(item))
        ) {
          setPresets(parsed);
        } else {
          console.warn("Invalid preset data in localStorage, ignoring");
          localStorage.removeItem("diceRollerPresets");
        }
      }
    } catch (error) {
      console.error("Failed to load presets from localStorage:", error);
      // Clear corrupted data
      try {
        localStorage.removeItem("diceRollerPresets");
      } catch (e) {
        // localStorage might not be available
      }
    }
  }, []);

  const savePresets = (newPresets: Preset[]) => {
    setPresets(newPresets);
    try {
      localStorage.setItem("diceRollerPresets", JSON.stringify(newPresets));
    } catch (error) {
      console.error("Failed to save presets to localStorage:", error);
      // Could show a user-friendly error message here
    }
  };

  const addPreset = (preset: Omit<Preset, "id">): Preset => {
    const sanitizedPreset = {
      ...preset,
      name: sanitizeString(preset.name),
      id: Date.now().toString(),
    };
    const updatedPresets = [...presets, sanitizedPreset];
    savePresets(updatedPresets);
    return sanitizedPreset;
  };

  const updatePreset = (id: string, updatedPreset: Partial<Preset>) => {
    const sanitizedUpdate = {
      ...updatedPreset,
      ...(updatedPreset.name && { name: sanitizeString(updatedPreset.name) }),
    };
    const newPresets = presets.map((preset) =>
      preset.id === id ? { ...preset, ...sanitizedUpdate } : preset
    );
    savePresets(newPresets);
  };

  const deletePreset = (id: string) => {
    savePresets(presets.filter((preset) => preset.id !== id));
  };

  return { presets, addPreset, updatePreset, deletePreset };
};
