import { earthboundFetch } from "../api/earthbound";

import {
  type ExerciseSettings,
  type PersonalRecord,
  type CreatePersonalRecord,
} from "@jmsutorus/earthbound-shared";

export type {
  ExerciseSettings,
  PersonalRecord,
  CreatePersonalRecord,
};

// === Settings ===

export async function getExerciseSettings(userId: string): Promise<ExerciseSettings> {
  const response = await earthboundFetch(`/api/personal-records/settings?userId=${userId}`);
  if (!response.ok) throw new Error(`Failed to fetch exercise settings: ${response.statusText}`);
  return response.json() as Promise<ExerciseSettings>;
}

export async function updateExerciseSettings(userId: string, enableRunning: boolean, enableWeights: boolean): Promise<boolean> {
  const response = await earthboundFetch(`/api/personal-records/settings`, {
    method: "PATCH",
    body: JSON.stringify({
      enable_running_prs: enableRunning,
      enable_weights_prs: enableWeights
    }),
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

// === Personal Records ===

export async function getPersonalRecords(userId: string, type?: "running" | "weights"): Promise<PersonalRecord[]> {
  let url = `/api/personal-records?userId=${userId}`;
  if (type) url += `&type=${type}`;
  
  const response = await earthboundFetch(url);
  if (!response.ok) throw new Error(`Failed to fetch personal records: ${response.statusText}`);
  return response.json() as Promise<PersonalRecord[]>;
}

export async function createPersonalRecord(userId: string, record: CreatePersonalRecord): Promise<number> {
  const response = await earthboundFetch(`/api/personal-records`, {
    method: "POST",
    body: JSON.stringify(record),
  });

  if (!response.ok) throw new Error(`Failed to create personal record: ${response.statusText}`);
  const result = await response.json() as { id: number };
  return result.id;
}

export async function deletePersonalRecord(id: number, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/personal-records/id/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

export async function updatePersonalRecord(id: number, userId: string, record: CreatePersonalRecord): Promise<boolean> {
  const response = await earthboundFetch(`/api/personal-records/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify(record),
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}
