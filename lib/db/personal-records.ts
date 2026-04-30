import { getDatabase } from "./index";

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
  const db = getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM exercise_settings WHERE userId = ?",
    args: [userId]
  });

  if (result.rows.length === 0) {
    // Return default settings if none exist
    return {
      userId,
      enable_running_prs: false,
      enable_weights_prs: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  const row = result.rows[0] as any;
  return {
    ...row,
    enable_running_prs: Boolean(row.enable_running_prs),
    enable_weights_prs: Boolean(row.enable_weights_prs),
  };
}

export async function updateExerciseSettings(userId: string, enableRunning: boolean, enableWeights: boolean): Promise<boolean> {
  const db = getDatabase();
  
  // Try to update first
  const updateResult = await db.execute({
    sql: `UPDATE exercise_settings 
          SET enable_running_prs = ?, enable_weights_prs = ?
          WHERE userId = ?`,
    args: [enableRunning ? 1 : 0, enableWeights ? 1 : 0, userId]
  });

  if (updateResult.rowsAffected === 0) {
    // If no rows affected, insert
    await db.execute({
      sql: `INSERT INTO exercise_settings (userId, enable_running_prs, enable_weights_prs)
            VALUES (?, ?, ?)`,
      args: [userId, enableRunning ? 1 : 0, enableWeights ? 1 : 0]
    });
  }

  return true;
}

// === Personal Records ===

export async function getPersonalRecords(userId: string, type?: "running" | "weights"): Promise<PersonalRecord[]> {
  const db = getDatabase();
  
  let sql = "SELECT * FROM personal_records WHERE userId = ?";
  const args: any[] = [userId];

  if (type) {
    sql += " AND type = ?";
    args.push(type);
  }

  sql += " ORDER BY date DESC, id DESC";

  const result = await db.execute({ sql, args });
  return result.rows.map((row: any) => ({
    ...row,
  })) as PersonalRecord[];
}

export async function createPersonalRecord(userId: string, record: CreatePersonalRecord): Promise<number> {
  const db = getDatabase();
  
  const result = await db.execute({
    sql: `INSERT INTO personal_records 
          (userId, type, date, notes, distance, total_seconds, exercise, weight, reps)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      userId,
      record.type,
      record.date,
      record.notes || null,
      record.distance || null,
      record.total_seconds || null,
      record.exercise || null,
      record.weight || null,
      record.reps || null
    ]
  });

  return Number(result.lastInsertRowid);
}

export async function deletePersonalRecord(id: number, userId: string): Promise<boolean> {
  const db = getDatabase();
  const result = await db.execute({
    sql: "DELETE FROM personal_records WHERE id = ? AND userId = ?",
    args: [id, userId]
  });
  return (result.rowsAffected ?? 0) > 0;
}

export async function updatePersonalRecord(id: number, userId: string, record: CreatePersonalRecord): Promise<boolean> {
  const db = getDatabase();
  const result = await db.execute({
    sql: `UPDATE personal_records 
          SET type = ?, date = ?, notes = ?, distance = ?, total_seconds = ?, exercise = ?, weight = ?, reps = ?
          WHERE id = ? AND userId = ?`,
    args: [
      record.type,
      record.date,
      record.notes || null,
      record.distance || null,
      record.total_seconds || null,
      record.exercise || null,
      record.weight || null,
      record.reps || null,
      id,
      userId
    ]
  });
  return (result.rowsAffected ?? 0) > 0;
}
