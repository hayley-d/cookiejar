import type { InsightRule } from '@/coach/Insight';
import { noData } from '@/coach/rules/noData';
import { weekAhead } from '@/coach/rules/weekAhead';

export const insightRules: readonly InsightRule[] = [noData, weekAhead];
