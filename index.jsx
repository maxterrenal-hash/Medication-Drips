import React, { useMemo, useState } from "react";

// Generic formula for these weight-based drips
//   concentration (mcg/mL) = (drug_mg * 1000) / diluent_mL
//   rate (mL/min) = [ dose (mcg/kg/min) * weight (kg) ] / concentration (mcg/mL)

// Small helper to format numbers safely
function fmt(n: number, digits = 3) {
  return Number.isFinite(n) ? n.toFixed(digits) : (0).toFixed(digits);
}

type DrugSectionProps = {
  title: string;
  headerColor: string; // e.g., "bg-indigo-600"
  borderColor: string; // e.g., "border-indigo-200 dark:border-indigo-900"
  accentClass?: string; // e.g., "accent-indigo-600"
  mgOptions: number[]; // e.g., [200,400,800]
  diluentOptions: number[]; // e.g., [100,250]
  doseMin: number;
  doseMax: number;
  doseStep: number;
  weight: number;
};

function DrugSection({
  title,
  headerColor,
  borderColor,
  accentClass = "accent-indigo-600",
  mgOptions,
  diluentOptions,
  doseMin,
  doseMax,
  doseStep,
  weight,
}: DrugSectionProps) {
  const [drugMg, setDrugMg] = useState<number>(mgOptions[0]);
  const [diluent, setDiluent] = useState<number>(diluentOptions[0]);
  const [dose, setDose] = useState<number>(doseMin);

  const concentrationMcgPerMl = useMemo(() => (drugMg * 1000) / diluent, [drugMg, diluent]);
  const rateMlPerMin = useMemo(() => {
    if (!weight || weight <= 0) return 0;
    return (dose * weight) / concentrationMcgPerMl;
  }, [dose, weight, concentrationMcgPerMl]);
  const rateMlPerHr = useMemo(() => rateMlPerMin * 60, [rateMlPerMin]);

  return (
    <section className="mb-10">
      <div className={`rounded-2xl border ${borderColor} overflow-hidden shadow-sm`}>
        <div className={`${headerColor} text-white px-4 py-3`}>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        <div className="p-4 sm:p-5 space-y-5 bg-white dark:bg-zinc-800">
          {/* Concentration */}
          <div>
            <div className="text-sm font-medium mb-2">Concentration</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-xs text-zinc-500 mb-1">Drug (mg)</label>
                <select
                  value={drugMg}
                  onChange={(e) => setDrugMg(Number(e.target.value))}
                  className="rounded-xl border border-zinc-300 bg-white dark:bg-zinc-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                  {mgOptions.map((mg) => (
                    <option key={mg} value={mg}>{mg} mg</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-zinc-500 mb-1">Dilution (mL)</label>
                <select
                  value={diluent}
                  onChange={(e) => setDiluent(Number(e.target.value))}
                  className="rounded-xl border border-zinc-300 bg-white dark:bg-zinc-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                  {diluentOptions.map((mL) => (
                    <option key={mL} value={mL}>{mL} mL</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Concentration: <span className="font-medium">{fmt(concentrationMcgPerMl, 0)} mcg/mL</span>
            </p>
          </div>

          {/* Dose */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Dose</div>
              <div className="text-sm tabular-nums"><span className="font-semibold">{dose}</span> mcg/kg/min</div>
            </div>
            <input
              type="range"
              min={doseMin}
              max={doseMax}
              step={doseStep}
              value={dose}
              onChange={(e) => setDose(Number(e.target.value))}
              className={`w-full ${accentClass}`}
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>{doseMin}</span>
              <span>{doseMax}</span>
            </div>
          </div>

          {/* Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
              <div className="text-xs text-zinc-500">Rate</div>
              <div className="text-2xl font-bold tabular-nums">
                {fmt(rateMlPerMin)} <span className="text-base font-semibold ml-1">mL/min</span>
              </div>
              <div className="text-xs text-zinc-500 mt-1">Computed from weight, dose, and concentration.</div>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
              <div className="text-xs text-zinc-500">Also handy</div>
              <div className="text-2xl font-bold tabular-nums">
                {fmt(rateMlPerHr, 1)} <span className="text-base font-semibold ml-1">mL/hr</span>
              </div>
              <div className="text-xs text-zinc-500 mt-1">Same rate, per hour.</div>
            </div>
          </div>

          {/* Formula */}
          <details className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-900">
            <summary className="cursor-pointer text-sm font-medium">Show formula</summary>
            <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
              <p>
                <span className="font-semibold">rate (mL/min)</span> = [ <span className="font-mono">dose (mcg/kg/min)</span> × <span className="font-mono">weight (kg)</span> ] ÷ <span className="font-mono">concentration (mcg/mL)</span>
              </p>
              <p>
                <span className="font-semibold">concentration</span> = ( <span className="font-mono">drug (mg)</span> × 1000 ) ÷ <span className="font-mono">diluent (mL)</span>
              </p>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}

export default function MedicationDripsApp() {
  const [weightInput, setWeightInput] = useState<number | "">("");
  const weight = typeof weightInput === "number" ? weightInput : Number(weightInput);

  return (
    <div className="min-h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 p-5 sm:p-8">
      <div className="mx-auto max-w-3xl">
        {/* App Header */}
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Medication Drips</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Weight-based infusion calculator for Dopamine, Dobutamine, and Norepinephrine.</p>
        </header>

        {/* Weight Input */}
        <section className="mb-6">
          <label className="block text-xl font-semibold mb-2">Weight (kg)</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g., 70"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-64 sm:w-72 text-lg rounded-2xl border border-zinc-300 bg-white dark:bg-zinc-800 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {(!weight || Number(weight) <= 0) && (
              <span className="text-xs text-zinc-500">Enter a positive weight to compute.</span>
            )}
          </div>
        </section>

        {/* DOPAMINE */}
        <DrugSection
          title="Dopamine"
          headerColor="bg-indigo-600"
          borderColor="border-indigo-200 dark:border-indigo-900"
          accentClass="accent-indigo-600"
          mgOptions={[200, 400, 800]}
          diluentOptions={[100, 250]}
          doseMin={0}
          doseMax={20}
          doseStep={1}
          weight={weight}
        />

        {/* DOBUTAMINE */}
        <DrugSection
          title="Dobutamine"
          headerColor="bg-teal-600"
          borderColor="border-teal-200 dark:border-teal-900"
          accentClass="accent-teal-600"
          mgOptions={[250, 500, 1000]}
          diluentOptions={[100, 250]}
          doseMin={0}
          doseMax={20}
          doseStep={1}
          weight={weight}
        />

        {/* NOREPINEPHRINE */}
        <DrugSection
          title="Norepinephrine"
          headerColor="bg-violet-600"
          borderColor="border-violet-200 dark:border-violet-900"
          accentClass="accent-violet-600"
          mgOptions={[2, 4, 8, 16, 32]}
          diluentOptions={[100, 250]}
          doseMin={0}
          doseMax={2}
          doseStep={0.1}
          weight={weight}
        />

        {/* Footer */}
        <footer className="text-xs text-zinc-500 dark:text-zinc-400">
          Built for quick bedside math. Verify against local protocols before use.
        </footer>
      </div>
    </div>
  );
}
