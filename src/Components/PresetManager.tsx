import React, { useState } from "react";
import { Preset } from "../hooks/usePresets";

type PresetManagerProps = {
  currentSettings: Omit<Preset, "id" | "name">;
  presets: Preset[];
  onAddPreset: (preset: Omit<Preset, "id">) => void;
  onUpdatePreset: (id: string, preset: Partial<Preset>) => void;
  onDeletePreset: (id: string) => void;
  onLoadPreset: (preset: Preset) => void;
};

export const PresetManager: React.FC<PresetManagerProps> = ({
  currentSettings,
  presets,
  onAddPreset,
  onUpdatePreset,
  onDeletePreset,
  onLoadPreset,
}) => {
  const [newPresetName, setNewPresetName] = useState("");
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);

  const handleAddPreset = () => {
    if (newPresetName) {
      onAddPreset({ ...currentSettings, name: newPresetName });
      setNewPresetName("");
    }
  };

  const handleUpdatePresetName = (id: string, newName: string) => {
    onUpdatePreset(id, { name: newName });
    setEditingPresetId(null);
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-md rounded-xl p-8 shadow-xl">
      <h2 className="text-2xl mb-4">Presets</h2>
      <div className="mb-4">
        <input
          type="text"
          value={newPresetName}
          onChange={(e) => setNewPresetName(e.target.value)}
          placeholder="New preset name"
          className="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-600"
        />
        <button
          onClick={handleAddPreset}
          className="mt-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] px-4 py-2 rounded-lg transition-colors"
        >
          Add Current Settings as Preset
        </button>
      </div>
      <ul className="space-y-2">
        {presets.map((preset) => (
          <li key={preset.id} className="flex items-center justify-between">
            {editingPresetId === preset.id ? (
              <input
                type="text"
                value={preset.name}
                onChange={(e) =>
                  handleUpdatePresetName(preset.id, e.target.value)
                }
                onBlur={() => setEditingPresetId(null)}
                autoFocus
                className="bg-[#1a1a1a] text-white px-2 py-1 rounded"
              />
            ) : (
              <span onClick={() => setEditingPresetId(preset.id)}>
                {preset.name}
              </span>
            )}
            <div>
              <button
                onClick={() => onLoadPreset(preset)}
                className="mr-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] px-2 py-1 rounded transition-colors"
              >
                Load
              </button>
              <button
                onClick={() => onDeletePreset(preset.id)}
                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};