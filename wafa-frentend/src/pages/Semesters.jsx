import React, { useState } from "react";

const Semesters = () => {
  const initialBoard = {
    S10: [{ id: "sp", title: "santé publique" }],
    S9: [],
    S8: [],
    S7: [],
    S6: [],
    S5: [],
    S4: [{ id: "pharma", title: "pharmacologie" }],
    S3: [{ id: "semio1", title: "semiologie 1" }],
    S2: [{ id: "physio1", title: "physiologie 1" }],
    S1: [{ id: "anat1", title: "anatomie 1" }],
  };

  const [board, setBoard] = useState(initialBoard);

  const handleDragStart = (event, fromColumnId, itemId) => {
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ fromColumnId, itemId })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event, toColumnId) => {
    event.preventDefault();
    try {
      const raw = event.dataTransfer.getData("text/plain");
      if (!raw) return;
      const { fromColumnId, itemId } = JSON.parse(raw);
      if (!fromColumnId || !itemId || fromColumnId === toColumnId) return;

      setBoard((prev) => {
        const sourceItems = [...prev[fromColumnId]];
        const targetItems = [...prev[toColumnId]];
        const movingIndex = sourceItems.findIndex((i) => i.id === itemId);
        if (movingIndex === -1) return prev;
        const [movingItem] = sourceItems.splice(movingIndex, 1);
        return {
          ...prev,
          [fromColumnId]: sourceItems,
          [toColumnId]: [{ ...movingItem }, ...targetItems],
        };
      });
    } catch (_) {
      // ignore parsing errors
    }
  };

  const columns = Object.keys(board);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Semestres</h1>
          <p className="text-gray-600 mt-1">
            Organisez les modules par semestre (Kanban)
          </p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-lg p-4">
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-6 min-w-max">
            {columns.map((columnId) => {
              const items = board[columnId];
              return (
                <div
                  key={columnId}
                  className="w-72 shrink-0 bg-white rounded-2xl border border-blue-100 shadow-md"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, columnId)}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-white/60 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center font-semibold text-gray-700">
                        {columnId}
                      </div>
                      <span className="text-sm text-gray-500">
                        {items.length} modules
                      </span>
                    </div>
                    <span className="text-gray-400">⋯</span>
                  </div>

                  {/* Column body */}
                  <div className="p-3 flex flex-col gap-3 min-h-[280px]">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, columnId, item.id)
                        }
                        className="bg-white/90 border border-gray-200 rounded-xl px-4 py-3 shadow-sm hover:shadow cursor-grab active:cursor-grabbing"
                      >
                        <div className="text-gray-800 font-medium text-sm">
                          {item.title}
                        </div>
                      </div>
                    ))}

                    {/* Empty state dropzone */}
                    {items.length === 0 && (
                      <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 text-center text-gray-400">
                        Déposer un module ici
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Semesters;
