import { parseExerciseLibraryCsv } from '@/exercises/parseExerciseLibraryCsv';
import { renderDefaultExercisesModule } from '@/exercises/renderDefaultExercisesModule';

const csvPath = 'assets/workouts.csv';
const modulePath = 'src/exercises/defaultExercises.ts';

const csvText = await Bun.file(csvPath).text();
const exercises = parseExerciseLibraryCsv(csvText);
await Bun.write(modulePath, renderDefaultExercisesModule(exercises));
console.log(`Wrote ${exercises.length} exercises to ${modulePath}`);
