"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { deletePlant, waterPlant } from "@/lib/actions/plants";
import {
  formatLastWatered,
  getLightLevelLabel,
} from "@/lib/plant-form";
import { getWateringStatus, type Plant } from "@/lib/plants";

export function PlantCard({ plant }: { plant: Plant }) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const watering = getWateringStatus(plant);

  function handleWater() {
    startTransition(async () => {
      await waterPlant(plant.id);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePlant(plant.id);
      if (!result.error) {
        setConfirmDelete(false);
      }
    });
  }

  return (
    <article className="overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50/40">
      {plant.image_url ? (
        <div className="relative h-36 w-full bg-emerald-100">
          <Image
            src={plant.image_url}
            alt={plant.name_he}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 300px"
          />
        </div>
      ) : (
        <div className="flex h-36 items-center justify-center bg-emerald-100 text-3xl">
          🪴
        </div>
      )}

      <div className="space-y-2 p-3">
        <h3 className="font-semibold text-emerald-900">{plant.name_he}</h3>

        <p className="text-xs text-emerald-600">
          {getLightLevelLabel(plant.light_level)}
        </p>

        <p
          className={`text-sm font-medium ${
            watering.status === "due"
              ? "text-red-600"
              : watering.status === "unknown"
                ? "text-amber-700"
                : "text-emerald-700"
          }`}
        >
          {watering.label}
        </p>

        <p className="text-xs text-emerald-600">
          {watering.status === "due"
            ? "מומלץ להשקות היום"
            : watering.status === "unknown"
              ? "מומלץ להשקות ולעדכן"
              : `עוד ${watering.daysRemaining} ימים להשקיה`}
        </p>

        <p className="text-xs text-emerald-700">
          🕐 {formatLastWatered(plant.last_watered_at)}
        </p>

        <button
          type="button"
          onClick={handleWater}
          disabled={pending}
          className="w-full rounded-lg bg-emerald-700 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "מעדכן..." : "השקיתי היום"}
        </button>

        {confirmDelete ? (
          <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-2">
            <p className="text-xs text-red-800">למחוק את {plant.name_he}?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="flex-1 rounded-lg bg-red-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {pending ? "מוחק..." : "כן, מחקי"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={pending}
                className="flex-1 rounded-lg border border-red-200 bg-white px-2 py-1.5 text-xs text-red-800 hover:bg-red-50"
              >
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full rounded-lg border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50"
          >
            מחקי צמח
          </button>
        )}
      </div>
    </article>
  );
}
