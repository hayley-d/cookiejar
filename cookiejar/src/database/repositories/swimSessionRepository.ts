import type { SQLiteDatabase } from 'expo-sqlite';

import { getSwimWorkoutDetail } from '@/database/repositories/workoutRepository';
import { expandSwimRepetitions } from '@/swimming/expandSwimRepetitions';
import type {
  SwimSessionBlock,
  SwimSessionDetail,
  SwimSessionSection,
  SwimSessionSet,
} from '@/swimming/swimSessionTypes';
import type { SwimEquipment } from '@/types/SwimEquipment';
import { swimEquipmentList } from '@/types/SwimEquipment';
import { defaultSwimPoolLength, isSwimPoolLength } from '@/types/SwimPoolLength';
import type { SwimRestMode } from '@/types/SwimRestMode';

type SessionSwimSectionRow = { id: number; name: string };

type SessionSwimBlockRow = { id: number; section_id: number; rounds: number; rest_after_seconds: number | null };

type SessionSwimSetRow = {
  id: number;
  block_id: number;
  exercise_id: number | null;
  exercise_name: string;
  repetitions: number;
  distance_meters: number;
  rest_mode: SwimRestMode;
  rest_seconds: number | null;
  send_off_seconds: number | null;
  rest_after_seconds: number | null;
  notes: string | null;
};

type SessionSwimEquipmentRow = { session_swim_set_id: number; equipment: SwimEquipment };

type SessionSwimRepetitionRow = {
  id: number;
  session_swim_set_id: number;
  round_index: number;
  repetition_index: number;
  completed_at: string | null;
};

export async function snapshotSwimWorkout(
  database: SQLiteDatabase,
  sessionId: number,
  workoutId: number,
  poolLengthMeters: number | null,
): Promise<void> {
  const swimDetail = await getSwimWorkoutDetail(database, workoutId, poolLengthMeters);
  const sessionSetIds: number[][][] = [];

  for (const [sectionPosition, section] of swimDetail.sections.entries()) {
    const sectionResult = await database.runAsync(
      'INSERT INTO session_swim_sections (session_id, position, name) VALUES (?, ?, ?)',
      sessionId,
      sectionPosition,
      section.name,
    );
    const sectionSetIds: number[][] = [];
    sessionSetIds.push(sectionSetIds);
    for (const [blockPosition, block] of section.blocks.entries()) {
      const blockResult = await database.runAsync(
        'INSERT INTO session_swim_blocks (section_id, position, rounds, rest_after_seconds) VALUES (?, ?, ?, ?)',
        sectionResult.lastInsertRowId,
        blockPosition,
        block.rounds,
        block.restAfterSeconds,
      );
      const blockSetIds: number[] = [];
      sectionSetIds.push(blockSetIds);
      for (const [setPosition, set] of block.sets.entries()) {
        const setResult = await database.runAsync(
          `INSERT INTO session_swim_sets
            (block_id, position, exercise_id, exercise_name, repetitions, distance_meters, rest_mode, rest_seconds,
              send_off_seconds, rest_after_seconds, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          blockResult.lastInsertRowId,
          setPosition,
          set.exerciseId,
          set.exerciseName,
          set.repetitions,
          set.distanceMeters,
          set.restMode,
          set.restSeconds,
          set.sendOffSeconds,
          set.restAfterSeconds,
          set.notes,
        );
        blockSetIds.push(setResult.lastInsertRowId);
        for (const equipment of set.equipment) {
          await database.runAsync(
            'INSERT INTO session_swim_set_equipment (session_swim_set_id, equipment) VALUES (?, ?)',
            setResult.lastInsertRowId,
            equipment,
          );
        }
      }
    }
  }

  for (const position of expandSwimRepetitions(swimDetail.sections)) {
    await database.runAsync(
      `INSERT INTO session_swim_repetitions (session_swim_set_id, round_index, repetition_index)
      VALUES (?, ?, ?)`,
      sessionSetIds[position.sectionIndex][position.blockIndex][position.setIndex],
      position.roundIndex,
      position.repetitionIndex,
    );
  }
}

export async function getSwimSessionDetail(
  database: SQLiteDatabase,
  sessionId: number,
  poolLengthMeters: number | null,
): Promise<SwimSessionDetail> {
  const sectionRows = await database.getAllAsync<SessionSwimSectionRow>(
    'SELECT id, name FROM session_swim_sections WHERE session_id = ? ORDER BY position',
    sessionId,
  );
  const blockRows = await database.getAllAsync<SessionSwimBlockRow>(
    `SELECT session_swim_blocks.id, session_swim_blocks.section_id, session_swim_blocks.rounds,
      session_swim_blocks.rest_after_seconds
    FROM session_swim_blocks
    JOIN session_swim_sections ON session_swim_sections.id = session_swim_blocks.section_id
    WHERE session_swim_sections.session_id = ?
    ORDER BY session_swim_blocks.section_id, session_swim_blocks.position`,
    sessionId,
  );
  const setRows = await database.getAllAsync<SessionSwimSetRow>(
    `SELECT session_swim_sets.id, session_swim_sets.block_id, session_swim_sets.exercise_id,
      session_swim_sets.exercise_name, session_swim_sets.repetitions, session_swim_sets.distance_meters,
      session_swim_sets.rest_mode, session_swim_sets.rest_seconds, session_swim_sets.send_off_seconds,
      session_swim_sets.rest_after_seconds, session_swim_sets.notes
    FROM session_swim_sets
    JOIN session_swim_blocks ON session_swim_blocks.id = session_swim_sets.block_id
    JOIN session_swim_sections ON session_swim_sections.id = session_swim_blocks.section_id
    WHERE session_swim_sections.session_id = ?
    ORDER BY session_swim_sets.block_id, session_swim_sets.position`,
    sessionId,
  );
  const equipmentRows = await database.getAllAsync<SessionSwimEquipmentRow>(
    `SELECT session_swim_set_equipment.session_swim_set_id, session_swim_set_equipment.equipment
    FROM session_swim_set_equipment
    JOIN session_swim_sets ON session_swim_sets.id = session_swim_set_equipment.session_swim_set_id
    JOIN session_swim_blocks ON session_swim_blocks.id = session_swim_sets.block_id
    JOIN session_swim_sections ON session_swim_sections.id = session_swim_blocks.section_id
    WHERE session_swim_sections.session_id = ?`,
    sessionId,
  );
  const repetitionRows = await database.getAllAsync<SessionSwimRepetitionRow>(
    `SELECT session_swim_repetitions.id, session_swim_repetitions.session_swim_set_id,
      session_swim_repetitions.round_index, session_swim_repetitions.repetition_index,
      session_swim_repetitions.completed_at
    FROM session_swim_repetitions
    JOIN session_swim_sets ON session_swim_sets.id = session_swim_repetitions.session_swim_set_id
    JOIN session_swim_blocks ON session_swim_blocks.id = session_swim_sets.block_id
    JOIN session_swim_sections ON session_swim_sections.id = session_swim_blocks.section_id
    WHERE session_swim_sections.session_id = ?
    ORDER BY session_swim_repetitions.session_swim_set_id, session_swim_repetitions.round_index,
      session_swim_repetitions.repetition_index`,
    sessionId,
  );

  const toSwimSessionSet = (setRow: SessionSwimSetRow): SwimSessionSet => {
    const equipmentOfSet = equipmentRows
      .filter((equipmentRow) => equipmentRow.session_swim_set_id === setRow.id)
      .map((equipmentRow) => equipmentRow.equipment);
    return {
      id: setRow.id,
      exerciseId: setRow.exercise_id,
      exerciseName: setRow.exercise_name,
      repetitions: setRow.repetitions,
      distanceMeters: setRow.distance_meters,
      restMode: setRow.rest_mode,
      restSeconds: setRow.rest_seconds,
      sendOffSeconds: setRow.send_off_seconds,
      restAfterSeconds: setRow.rest_after_seconds,
      equipment: swimEquipmentList.filter((equipment) => equipmentOfSet.includes(equipment)),
      notes: setRow.notes,
      repetitionRows: repetitionRows
        .filter((repetitionRow) => repetitionRow.session_swim_set_id === setRow.id)
        .map((repetitionRow) => ({
          id: repetitionRow.id,
          roundIndex: repetitionRow.round_index,
          repetitionIndex: repetitionRow.repetition_index,
          completedAt: repetitionRow.completed_at,
        })),
    };
  };

  const sections: SwimSessionSection[] = sectionRows.map((sectionRow) => ({
    id: sectionRow.id,
    name: sectionRow.name,
    blocks: blockRows
      .filter((blockRow) => blockRow.section_id === sectionRow.id)
      .map(
        (blockRow): SwimSessionBlock => ({
          id: blockRow.id,
          rounds: blockRow.rounds,
          restAfterSeconds: blockRow.rest_after_seconds,
          sets: setRows.filter((setRow) => setRow.block_id === blockRow.id).map(toSwimSessionSet),
        }),
      ),
  }));

  return {
    poolLengthMeters:
      poolLengthMeters !== null && isSwimPoolLength(poolLengthMeters) ? poolLengthMeters : defaultSwimPoolLength,
    sections,
  };
}

export async function setSwimRepetitionCompletion(
  database: SQLiteDatabase,
  repetitionId: number,
  completedAt: string | null,
): Promise<void> {
  await database.runAsync(
    'UPDATE session_swim_repetitions SET completed_at = ? WHERE id = ?',
    completedAt,
    repetitionId,
  );
}

export async function completeOpenSwimRepetitions(
  database: SQLiteDatabase,
  sessionId: number,
  completedAt: string,
): Promise<void> {
  await database.runAsync(
    `UPDATE session_swim_repetitions
    SET completed_at = ?
    WHERE completed_at IS NULL
      AND session_swim_set_id IN (
        SELECT session_swim_sets.id
        FROM session_swim_sets
        JOIN session_swim_blocks ON session_swim_blocks.id = session_swim_sets.block_id
        JOIN session_swim_sections ON session_swim_sections.id = session_swim_blocks.section_id
        WHERE session_swim_sections.session_id = ?
      )`,
    completedAt,
    sessionId,
  );
}

export async function finishSwimSession(
  database: SQLiteDatabase,
  sessionId: number,
  finishedAt: string,
): Promise<void> {
  await database.runAsync(
    'UPDATE sessions SET finished_at = ? WHERE id = ? AND finished_at IS NULL',
    finishedAt,
    sessionId,
  );
}
