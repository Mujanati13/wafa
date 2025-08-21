import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const PlanModal = ({
  open,
  title = "Create Plan",
  initialPlan,
  onSave,
  onCancel,
}) => {
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    price: "",
    oldPrice: "",
    features: [],
    featuresInput: "",
  });

  React.useEffect(() => {
    if (!open) return;
    const featuresArray = Array.isArray(initialPlan?.features)
      ? initialPlan.features
      : (initialPlan?.featuresText || "")
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean);
    setForm({
      name: initialPlan?.name ?? "",
      description: initialPlan?.description ?? "",
      price:
        initialPlan?.price === 0 || initialPlan?.price
          ? String(initialPlan.price)
          : "",
      oldPrice:
        initialPlan?.oldPrice === 0 || initialPlan?.oldPrice
          ? String(initialPlan.oldPrice)
          : "",
      features: featuresArray,
      featuresInput: "",
    });
  }, [open, initialPlan]);

  if (!open) return null;

  return (
    <div className="flex justify-center items-center min-h-screen bg-black/50 p-4 z-[99999999999] absolute top-0 left-0 w-full h-full">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">{title}</h1>
          <p className="text-sm text-gray-600">
            Define plan details, pricing, and features
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plan-name">Plan title</Label>
              <Input
                id="plan-name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="plan-desc">Description</Label>
              <textarea
                id="plan-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex min-h-[80px] w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="old-price">Old price</Label>
              <Input
                id="old-price"
                type="number"
                step="0.01"
                value={form.oldPrice}
                onChange={(e) =>
                  setForm((p) => ({ ...p, oldPrice: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="price">New price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((p) => ({ ...p, price: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="features-input">Features</Label>
            <div className="flex gap-2">
              <Input
                id="features-input"
                placeholder="Add a feature and press Enter or click Add"
                value={form.featuresInput}
                onChange={(e) =>
                  setForm((p) => ({ ...p, featuresInput: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const value = form.featuresInput.trim();
                    if (!value) return;
                    if (form.features.includes(value)) return;
                    setForm((p) => ({
                      ...p,
                      features: [...p.features, value],
                      featuresInput: "",
                    }));
                  }
                }}
              />
              <Button
                type="button"
                className="bg-gray-900 hover:bg-black text-white"
                onClick={() => {
                  const value = form.featuresInput.trim();
                  if (!value) return;
                  if (form.features.includes(value)) return;
                  setForm((p) => ({
                    ...p,
                    features: [...p.features, value],
                    featuresInput: "",
                  }));
                }}
              >
                Add
              </Button>
            </div>

            {Array.isArray(form.features) && form.features.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.features.map((f, idx) => (
                  <span
                    key={`${f}-${idx}`}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                  >
                    {f}
                    <button
                      type="button"
                      className="ml-1 text-gray-500 hover:text-red-600"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          features: p.features.filter((x) => x !== f),
                        }))
                      }
                      aria-label={`Remove ${f}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-900"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-gray-900 hover:bg-black text-white"
              onClick={() => onSave(form)}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanModal;
