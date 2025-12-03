import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Preset } from "../hooks/usePresets";

type PresetManagerProps = {
  currentSettings: Omit<Preset, "id" | "name">;
  presets: Preset[];
  onAddPreset: (preset: Omit<Preset, "id">) => void;
  onUpdatePreset: (id: string, preset: Partial<Preset>) => void;
  onDeletePreset: (id: string) => void;
  onLoadPreset: (preset: Preset) => void;
  onReorderPresets: (newPresets: Preset[]) => void;
  activePresetId: string | null;
};

const MoreOptionsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

export const PresetManager: React.FC<PresetManagerProps> = ({
  currentSettings,
  presets,
  onAddPreset,
  onUpdatePreset,
  onDeletePreset,
  onLoadPreset,
  onReorderPresets,
  activePresetId,
}) => {
  const [newPresetName, setNewPresetName] = useState("");
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState<{
    id: string;
    type: string;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handlePresetClick = useCallback(
    (preset: Preset) => {
      onLoadPreset(preset);
    },
    [onLoadPreset]
  );

  const handleMenuClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId((prevId) => (prevId === id ? null : id));
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
        setOpenMenuId(null);
      }, 300);
    },
    []
  );

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newPresets = Array.from(presets);
    const [reorderedItem] = newPresets.splice(result.source.index, 1);
    newPresets.splice(result.destination.index, 0, reorderedItem);

    onReorderPresets(newPresets);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl">
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
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="presets">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {presets.map((preset, index) => (
                <Draggable
                  key={preset.id}
                  draggableId={preset.id}
                  index={index}
                >
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`relative rounded transition-all duration-300 ${
                        activePresetId === preset.id
                          ? "bg-white/20 border border-white/50"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <div
                        className="flex items-center justify-between p-2 cursor-pointer"
                        onClick={() => handlePresetClick(preset)}
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
                        <button
                          onClick={(e) => handleMenuClick(e, preset.id)}
                          className="p-1 rounded-full hover:bg-white/20"
                        >
                          <MoreOptionsIcon />
                        </button>
                      </div>
                      {openMenuId === preset.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1 flex flex-col space-y-1 p-1 bg-[#1a1a1a] rounded shadow-lg z-10"
                        >
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
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
