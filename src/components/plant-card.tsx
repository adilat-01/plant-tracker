"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { waterPlant } from "@/lib/actions/plants";
import {
  formatLastWatered,
  getLightLevelLabel,
} from "@/lib/plant-form";
import { getWateringStatus, type Plant } from "@/lib/plants";

export function PlantCard({ plant }: { plant: Plant }) {
  const [pending, startTransition] = useTransition();
  const watering = getWateringStatus(plant);

  function handleWater() {
    startTransition(async () => {
      await waterPlant(plant.id);
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
      </div>
    </article>
  );
}
