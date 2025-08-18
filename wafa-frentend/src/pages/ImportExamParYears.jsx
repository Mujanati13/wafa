import React, { useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Plus, Trash } from "lucide-react";

const ImportExamParYears = () => {
  const modules = useMemo(
    () => [
      "Anatomie 1",
      "Biophysique",
      "Embryologie",
      "Histologie",
      "Physiologie 1",
      "Biochimie 1",
    ],
    []
  );

  const examsByModule = useMemo(
    () => ({
      "Anatomie 1": [
        "Anatomie 1 - 2021",
        "Anatomie 1 - 2022",
        "Anatomie 1 - 2023",
      ],
      Biophysique: ["Biophysique - 2022", "Biophysique - 2023"],
      Embryologie: ["Embryologie - 2021", "Embryologie - 2024"],
      Histologie: ["Histologie - 2023"],
      "Physiologie 1": ["Physiologie 1 - 2022", "Physiologie 1 - 2023"],
      "Biochimie 1": ["Biochimie 1 - 2023"],
    }),
    []
  );

  const [selectedModule, setSelectedModule] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [excelFile, setExcelFile] = useState(null);

  // Left column: images attachment to question numbers
  const [imageMappings, setImageMappings] = useState([
    { id: crypto.randomUUID(), file: null, questionNumbers: "" },
  ]);

  // Right column: integrate questions into a sub module
  const [subModuleMappings, setSubModuleMappings] = useState([
    { id: crypto.randomUUID(), name: "", questionNumbers: "" },
  ]);

  const handleAddImageRow = () =>
    setImageMappings((prev) => [
      ...prev,
      { id: crypto.randomUUID(), file: null, questionNumbers: "" },
    ]);

  const handleRemoveImageRow = (id) =>
    setImageMappings((prev) => prev.filter((r) => r.id !== id));

  const handleAddSubModuleRow = () =>
    setSubModuleMappings((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", questionNumbers: "" },
    ]);

  const handleRemoveSubModuleRow = (id) =>
    setSubModuleMappings((prev) => prev.filter((r) => r.id !== id));

  const canImport = selectedModule && selectedExam && excelFile;

  const handleImport = () => {
    // Placeholder handler. Wire to API later.
    alert(
      `Import ready:\nModule: ${selectedModule}\nExam: ${selectedExam}\nExcel: ${excelFile?.name}\n` +
        `Images rows: ${imageMappings.length}\nSub-modules rows: ${subModuleMappings.length}`
    );
  };

  const examOptions = selectedModule ? examsByModule[selectedModule] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Import exam par years questions
            </h1>
            <p className="text-gray-600 mt-1">
              Select a module and exam, upload the Excel file, and optionally
              attach images or map questions into sous-modules.
            </p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Source</CardTitle>
            <CardDescription>
              Choose the module and exam (par year), then upload the Excel file
              containing questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Select module</Label>
                <Select
                  value={selectedModule}
                  onChange={(e) => {
                    setSelectedModule(e.target.value);
                    setSelectedExam("");
                  }}
                >
                  <option value="" disabled>
                    Choose a module
                  </option>
                  {modules.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>select exam par year name</Label>
                <Select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  disabled={!selectedModule}
                >
                  <option value="" disabled>
                    {selectedModule
                      ? "Choose an exam"
                      : "Select a module first"}
                  </option>
                  {examOptions.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Excel file of questions</Label>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              className="bg-black text-white hover:bg-gray-800"
              disabled={!canImport}
              onClick={handleImport}
            >
              + Import
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Optional mappings
            </CardTitle>
            <CardDescription>
              Add images per question numbers, or integrate questions into a
              sous module.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Add images */}
              <div className="border-r md:pr-6 border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">add images</h3>
                </div>
                <div className="space-y-4">
                  {imageMappings.map((row, idx) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
                    >
                      <div className="sm:col-span-2 space-y-2">
                        <Label>upload image</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setImageMappings((prev) =>
                              prev.map((r) =>
                                r.id === row.id ? { ...r, file } : r
                              )
                            );
                          }}
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <Label>question numbers related</Label>
                        <Input
                          placeholder="e.g. 1,2,5-7"
                          value={row.questionNumbers}
                          onChange={(e) =>
                            setImageMappings((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? { ...r, questionNumbers: e.target.value }
                                  : r
                              )
                            )
                          }
                        />
                      </div>
                      <div className="sm:col-span-1 flex gap-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleRemoveImageRow(row.id)}
                          disabled={imageMappings.length === 1}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div>
                    <Button variant="outline" onClick={handleAddImageRow}>
                      <Plus className="w-4 h-4 mr-1" /> Add image row
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right: Integrate questions in a sous module */}
              <div className="md:pl-6">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    integrate questions in a sous module
                  </h3>
                </div>
                <div className="space-y-4">
                  {subModuleMappings.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
                    >
                      <div className="sm:col-span-2 space-y-2">
                        <Label>sous module name</Label>
                        <Input
                          placeholder="e.g. Cardiologie"
                          value={row.name}
                          onChange={(e) =>
                            setSubModuleMappings((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? { ...r, name: e.target.value }
                                  : r
                              )
                            )
                          }
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <Label>questions numbers in</Label>
                        <Input
                          placeholder="e.g. 10-15,22"
                          value={row.questionNumbers}
                          onChange={(e) =>
                            setSubModuleMappings((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? { ...r, questionNumbers: e.target.value }
                                  : r
                              )
                            )
                          }
                        />
                      </div>
                      <div className="sm:col-span-1 flex gap-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleRemoveSubModuleRow(row.id)}
                          disabled={subModuleMappings.length === 1}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div>
                    <Button variant="outline" onClick={handleAddSubModuleRow}>
                      <Plus className="w-4 h-4 mr-1" /> Add sous-module row
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportExamParYears;
