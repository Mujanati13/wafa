import React, { useState, useEffect } from "react";
import { api } from "../lib/utils.js";

const Semesters = () => {
  const [board, setBoard] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [totalModules, setTotalModules] = useState(0);
  const [successMessage, setSuccessMessage] = useState(null);

  // Initialize empty semesters
  const initializeSemesters = () => {
    const semesters = {};
    for (let i = 1; i <= 10; i++) {
      semesters[`S${i}`] = [];
    }
    return semesters;
  };

  // Fetch modules from backend
  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching modules from backend...");

      const response = await api.get("/modules");
      console.log("Backend response:", response.data);

      if (response.data.success) {
        const modules = response.data.data;
        setTotalModules(modules.length);

        if (modules.length === 0) {
          console.log("No modules found in database");
          setBoard(initializeSemesters());
          return;
        }

        const semesters = initializeSemesters();

        // Group modules by semester
        modules.forEach((module) => {
          console.log("Processing module:", module);
          if (module.semester && semesters[module.semester]) {
            semesters[module.semester].push({
              id: module._id,
              title: module.name,
              imageUrl: module.imageUrl,
              infoText: module.infoText,
              totalQuestions: module.totalQuestions || 0,
            });
          } else {
            console.warn(
              "Module has invalid semester or semester not found:",
              module
            );
          }
        });

        console.log("Processed semesters:", semesters);
        setBoard(semesters);
      } else {
        throw new Error(response.data.message || "Failed to fetch modules");
      }
    } catch (err) {
      console.error("Error fetching modules:", err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      setError(`Failed to load modules: ${err.message}`);
      // Fallback to empty semesters
      setBoard(initializeSemesters());
    } finally {
      setLoading(false);
    }
  };

  // Update module semester in backend
  const updateModuleSemester = async (moduleId, newSemester) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccessMessage(null);
      console.log(`Updating module ${moduleId} to semester ${newSemester}`);

      // Only send the semester field to update
      const response = await api.put(`/modules/${moduleId}`, {
        semester: newSemester,
      });

      console.log("Backend response:", response.data);

      if (response.data.success) {
        console.log("Module semester updated successfully:", response.data);
        setSuccessMessage(
          `Module déplacé avec succès vers le semestre ${newSemester}`
        );
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
        return true;
      } else {
        throw new Error(response.data.message || "Failed to update module");
      }
    } catch (err) {
      console.error("Error updating module semester:", err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      setError(`Failed to update module semester: ${err.message}`);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Load modules on component mount
  useEffect(() => {
    fetchModules();
  }, []);

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

  const handleDrop = async (event, toColumnId) => {
    event.preventDefault();
    try {
      const raw = event.dataTransfer.getData("text/plain");
      if (!raw) return;
      const { fromColumnId, itemId } = JSON.parse(raw);
      if (!fromColumnId || !itemId || fromColumnId === toColumnId) return;

      console.log(
        `Moving module ${itemId} from ${fromColumnId} to ${toColumnId}`
      );

      // Optimistically update the UI
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

      // Update in backend
      const success = await updateModuleSemester(itemId, toColumnId);
      if (!success) {
        // Revert the UI change if backend update failed
        console.log("Backend update failed, reverting UI changes");
        fetchModules();
      }
    } catch (error) {
      console.error("Error in handleDrop:", error);
      // Revert the UI change if there was an error
      fetchModules();
    }
  };

  const columns = Object.keys(board);

  if (loading) {
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
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement des modules...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Semestres</h1>
          <p className="text-gray-600 mt-1">
            Organisez les modules par semestre (Kanban)
          </p>
          {totalModules > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {totalModules} module(s) chargé(s)
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2">
            <span className="font-medium">Erreur:</span>
            {error}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 text-sm mt-2"
          >
            Fermer
          </button>
        </div>
      )}

      {updating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
          Mise à jour en cours...
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          <div className="flex items-center gap-2">
            <span className="font-medium">Succès:</span>
            {successMessage}
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-500 hover:text-green-700 text-sm mt-2"
          >
            Fermer
          </button>
        </div>
      )}

      {totalModules === 0 && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          <div className="text-center">
            <p className="font-medium">Aucun module trouvé</p>
            <p className="text-sm mt-1">
              Il n'y a pas encore de modules dans la base de données. Créez des
              modules via la page d'administration.
            </p>
          </div>
        </div>
      )}

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
                        <div className="text-gray-800 font-medium text-sm mb-1">
                          {item.title}
                        </div>
                        {item.totalQuestions > 0 && (
                          <div className="text-xs text-gray-500">
                            {item.totalQuestions} questions
                          </div>
                        )}
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
