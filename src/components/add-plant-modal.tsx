"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  identifyPlant,
  savePlant,
  type PlantPreview,
} from "@/lib/actions/plants";
import { compressImageForUpload } from "@/lib/compress-image";
import {
  getLightLevelLabel,
  LIGHT_LEVELS,
  type LastWateredChoice,
} from "@/lib/plant-form";

type Room = { id: string; name: string };

type Step = "form" | "confirm";

export function AddPlantModal({
  rooms,
  open,
  onClose,
}: {
  rooms: Room[];
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<Step>("form");
  const [preview, setPreview] = useState<PlantPreview | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [lastWatered, setLastWatered] = useState<LastWateredChoice>("today");
  const [identifyState, identifyAction] = useActionState(identifyPlant, null);
  const [savePending, startSaveTransition] = useTransition();
  const [identifyPending, startIdentifyTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (identifyState?.preview) {
      setPreview(identifyState.preview);
      setStep("confirm");
      setLocalError(null);
    }
    if (identifyState?.error) {
      setLocalError(identifyState.error);
    }
  }, [identifyState]);

  function resetModal() {
    setStep("form");
    setPreview(null);
    setLocalError(null);
    setLastWatered("today");
    formRef.current?.reset();
  }

  function handleClose() {
    resetModal();
    onClose();
  }

  async function handleIdentify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("last_watered", lastWatered);

    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
      setLocalError("נא להעלות תמונה של הצמח");
      return;
    }

    try {
      const compressed = await compressImageForUpload(file);
      formData.set("image", compressed, compressed.name);

      startIdentifyTransition(() => {
        identifyAction(formData);
      });
    } catch {
      setLocalError("עיבוד התמונה נכשל. נסי תמונה אחרת.");
    }
  }

  function handleSave() {
    if (!preview) return;

    startSaveTransition(async () => {
      const result = await savePlant(preview);
      if (result.error) {
        setLocalError(result.error);
        return;
      }
      handleClose();
    });
  }

  const error = localError;
  const pending = identifyPending || savePending;

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="w-full max-w-md rounded-2xl border-0 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      {step === "form" ? (
        <form ref={formRef} onSubmit={handleIdentify} className="p-6">
          <ModalHeader onClose={handleClose} />

          {error ? <ErrorBox message={error} /> : null}

          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-emerald-900">
                תמונת הצמח
              </span>
              <input
                name="image"
                type="file"
                accept="image/*"
                capture="environment"
                required
                className="block w-full text-sm text-emerald-800 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-emerald-800"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-emerald-900">
                שם הצמח (אם יודעת)
              </span>
              <input
                name="user_guess_name"
                type="text"
                placeholder='למשל: "פOTHOS" או "סукulent"'
                className="w-full rounded-xl border border-emerald-200 px-3 py-2.5 text-sm outline-none ring-emerald-500 focus:ring-2"
              />
              <span className="text-xs text-emerald-600">
                Gemini יזהה מהתמונה ויאשר איתך את השם
              </span>
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-emerald-900">חדר</span>
              <select
                name="room_id"
                required
                defaultValue=""
                className="w-full rounded-xl border border-emerald-200 px-3 py-2.5 text-sm outline-none ring-emerald-500 focus:ring-2"
              >
                <option value="" disabled>
                  בחרי חדר...
                </option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-emerald-900">
                רמת אור 🌞
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {LIGHT_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-sm has-checked:border-emerald-600 has-checked:bg-emerald-50"
                  >
                    <input
                      type="radio"
                      name="light_level"
                      value={level.value}
                      required
                      className="accent-emerald-700"
                    />
                    {level.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-emerald-900">
                מתי הושקה לאחרונה? 💧
              </legend>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["today", "היום"],
                    ["yesterday", "אתמול"],
                    ["unknown", "לא זוכרת"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLastWatered(value)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      lastWatered === value
                        ? "bg-emerald-700 text-white"
                        : "border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {pending ? "מזהה..." : "זהה צמח"}
          </button>
        </form>
      ) : preview ? (
        <div className="p-6">
          <ModalHeader onClose={handleClose} />

          {error ? <ErrorBox message={error} /> : null}

          <div className="space-y-4">
            {preview.image_url ? (
              <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-xl bg-emerald-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.image_url}
                  alt={preview.name_he}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <div className="rounded-xl bg-emerald-50 p-4 text-center">
              <p className="text-sm text-emerald-700">זיהינו:</p>
              <p className="mt-1 text-xl font-bold text-emerald-900">
                {preview.name_he}
              </p>
            </div>

            {preview.confirmation_question ? (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                {preview.confirmation_question}
              </p>
            ) : null}

            {preview.user_guess_name &&
            preview.user_guess_name !== preview.name_he ? (
              <p className="text-center text-xs text-emerald-600">
                הזנת: &quot;{preview.user_guess_name}&quot;
              </p>
            ) : null}

            <div className="space-y-2 rounded-xl border border-emerald-100 p-4 text-sm text-emerald-800">
              <p>
                <strong>רמת אור:</strong>{" "}
                {getLightLevelLabel(preview.light_level)}
              </p>
              <p>
                <strong>השקיה כל:</strong> {preview.watering_interval_days}{" "}
                ימים
              </p>
              <p>
                <strong>הערות אור:</strong> {preview.light_notes}
              </p>
              <p>
                <strong>טיפים:</strong> {preview.care_tips}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setPreview(null);
                setLocalError(null);
              }}
              className="flex-1 rounded-xl border border-emerald-200 px-4 py-3 text-sm text-emerald-800 hover:bg-emerald-50"
            >
              חזרה
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className="flex-1 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {pending ? "שומר..." : "שמרי צמח"}
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-emerald-900">הוסף צמח</h2>
        <p className="mt-1 text-sm text-emerald-700">
          מלאי פרטים — Gemini יתאים את ההמלצות
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg px-2 py-1 text-emerald-700 hover:bg-emerald-50"
      >
        ✕
      </button>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}
