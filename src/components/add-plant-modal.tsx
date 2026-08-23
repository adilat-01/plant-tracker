"use client";

import { useActionState, useEffect, useRef } from "react";
import { addPlant } from "@/lib/actions/plants";

type Room = { id: string; name: string };

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
  const [state, action, pending] = useActionState(addPlant, null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state?.success, onClose]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-md rounded-2xl border-0 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <form action={action} className="p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-emerald-900">הוסף צמח</h2>
            <p className="mt-1 text-sm text-emerald-700">
              העלי תמונה — Gemini יזהה וישמור
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

        {state?.error ? (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-emerald-900">
              תמונת הצמח
            </span>
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              capture="environment"
              required
              className="block w-full text-sm text-emerald-800 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-emerald-800"
            />
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
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "מזהה ושומר..." : "זהה ושמור"}
        </button>
      </form>
    </dialog>
  );
}
