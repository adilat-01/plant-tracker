export type Plant = {
  id: string;
  household_id: string;
  room_id: string;
  name_he: string;
  watering_interval_days: number;
  light_notes: string | null;
  care_tips: string | null;
  light_level: string | null;
  image_url: string | null;
  last_watered_at: string | null;
  added_at: string;
};

export type WateringStatus = {
  status: "due" | "ok" | "unknown";
  label: string;
  daysRemaining: number;
};

export function getWateringStatus(plant: Plant): WateringStatus {
  if (!plant.last_watered_at) {
    return {
      status: "unknown",
      label: "לא ידוע מתי הושקה 💧",
      daysRemaining: 0,
    };
  }

  const daysSince = Math.floor(
    (Date.now() - new Date(plant.last_watered_at).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const daysRemaining = plant.watering_interval_days - daysSince;

  if (daysRemaining <= 0) {
    return {
      status: "due",
      label: "הגיע הזמן להשקות! 🚰",
      daysRemaining: 0,
    };
  }

  return {
    status: "ok",
    label: "הכל טוב 🌿",
    daysRemaining,
  };
}

export function groupPlantsByRoom(
  plants: Plant[]
): Record<string, Plant[]> {
  return plants.reduce<Record<string, Plant[]>>((acc, plant) => {
    if (!acc[plant.room_id]) acc[plant.room_id] = [];
    acc[plant.room_id].push(plant);
    return acc;
  }, {});
}
