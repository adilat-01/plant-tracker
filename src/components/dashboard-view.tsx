"use client";

import { useState } from "react";
import { AddPlantModal } from "@/components/add-plant-modal";
import { PlantCard } from "@/components/plant-card";
import { groupPlantsByRoom, type Plant } from "@/lib/plants";

type Room = { id: string; name: string; sort_order: number };

export function DashboardView({
  householdName,
  inviteCode,
  rooms,
  plants,
  signOutButton,
}: {
  householdName: string;
  inviteCode: string;
  rooms: Room[];
  plants: Plant[];
  signOutButton: React.ReactNode;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const plantsByRoom = groupPlantsByRoom(plants);

  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-3xl">🌿</p>
            <h1 className="mt-2 text-3xl font-bold text-emerald-900">
              {householdName}
            </h1>
            <p className="mt-1 text-sm text-emerald-700">
              קוד שיתוף:{" "}
              <span className="rounded bg-white px-2 py-0.5 font-mono font-semibold">
                {inviteCode}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              + הוסף צמח
            </button>
            {signOutButton}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {rooms.map((room) => {
            const roomPlants = plantsByRoom[room.id] ?? [];

            return (
              <article
                key={room.id}
                className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-emerald-900">
                  {room.name}
                </h2>

                {roomPlants.length === 0 ? (
                  <p className="mt-3 text-sm text-emerald-600">
                    עדיין אין צמחים בחדר הזה
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {roomPlants.map((plant) => (
                      <PlantCard key={plant.id} plant={plant} />
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>

      <AddPlantModal
        rooms={rooms}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
}
