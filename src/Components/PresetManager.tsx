import React, { useState, useCallback, useEffect, useRef } from "react";
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
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState<{
    id: string;
    type: string;
  } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

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

  const handlePresetClick = useCallback((id: string) => {
    setActivePresetId((prevId) => (prevId === id ? null : id));
  }, []);

  const handleButtonClick = useCallback(
    (
      e: React.MouseEvent,
      buttonId: string,
      buttonType: string,
      callback: () => void
    ) => {
      e.stopPropagation();
      setClickedButton({ id: buttonId, type: buttonType });
      callback();

      setTimeout(() => {
        setClickedButton(null);
        setActivePresetId(null);
      }, 300);
    },
    []
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setActivePresetId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          className="mt-2 px-4 py-2 rounded-lg transition-colors bg-[#1a1a1a] hover:bg-[#2a2a2a]"
        >
          Add Current Settings as Preset
        </button>
      </div>
      <ul className="space-y-2">
        {presets.map((preset) => (
          <li
            key={preset.id}
            className="relative rounded hover:bg-white hover:bg-opacity-10"
          >
            <div
              className="flex items-center justify-between p-2 cursor-pointer"
              onClick={() => handlePresetClick(preset.id)}
            >
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
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate">{preset.name}</span>
              )}
            </div>
            {activePresetId === preset.id && (
              <div
                ref={popupRef}
                className="absolute right-0 top-full mt-1 flex space-x-1 p-1 bg-[#1a1a1a] rounded shadow-lg z-10"
              >
                <button
                  onClick={(e) =>
                    handleButtonClick(e, preset.id, "load", () =>
                      onLoadPreset(preset)
                    )
                  }
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    clickedButton?.id === preset.id &&
                    clickedButton.type === "load"
                      ? "bg-blue-600"
                      : "bg-[#1a1a1a] hover:bg-[#2a2a2a]"
                  }`}
                >
                  Load
                </button>
                <button
                  onClick={(e) =>
                    handleButtonClick(e, preset.id, "update", () =>
                      onUpdatePreset(preset.id, currentSettings)
                    )
                  }
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    clickedButton?.id === preset.id &&
                    clickedButton.type === "update"
                      ? "bg-yellow-600"
                      : "bg-[#1a1a1a] hover:bg-[#2a2a2a]"
                  }`}
                >
                  Update
                </button>
                <button
                  onClick={(e) =>
                    handleButtonClick(e, preset.id, "delete", () =>
                      onDeletePreset(preset.id)
                    )
                  }
                  className="px-2 py-1 rounded text-sm bg-[#1a1a1a] hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
