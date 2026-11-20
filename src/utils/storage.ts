import { FLOWER_STAGES, RHYTHM_OPTIONS } from '../data/curriculum';
import {
  AppState,
  DayRecord,
  FlowerId,
  FlowerStageConfig,
  GrowthSubStage,
  RhythmMode,
} from '../types/app';

const STORAGE_KEY = 'petalbreath_state_v1';

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, offset: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + offset);
  return next;
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function getYesterdayKey(): string {
  return formatDateKey(addDays(new Date(), -1));
}

export function createInitialState(): AppState {
  return {
    rhythmMode: 'balanced',
    totalKegelSessions: 0,
    recordsByDate: {},
    unlockedSpecimens: [],
    reflections: {},
    lastLowTargetPromptDate: null,
    pendingBloomStage: null,
    startedDate: getTodayKey(),
  };
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...createInitialState(),
      ...parsed,
      recordsByDate: parsed.recordsByDate || {},
      unlockedSpecimens: parsed.unlockedSpecimens || [],
      reflections: parsed.reflections || {},
    };
  } catch {
    return createInitialState();
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function getDailyTarget(mode: RhythmMode): number {
  return RHYTHM_OPTIONS.find((r) => r.id === mode)?.dailyTarget ?? 2;
}

export interface PlantProgressInfo {
  stage: FlowerStageConfig;
  sessionsInStage: number;
  stageTarget: number;
  subStage: GrowthSubStage;
  subStageLabel: string;
  allBloomed: boolean;
  progressRatio: number; // 0..1
}

export function getPlantProgress(totalKegelSessions: number): PlantProgressInfo {
  const clamped = Math.max(0, totalKegelSessions);

  // Check if all 4 stages (84 total) are completed
  const lastStage = FLOWER_STAGES[FLOWER_STAGES.length - 1];
  if (clamped >= lastStage.cumulativeEnd) {
    return {
      stage: lastStage,
      sessionsInStage: lastStage.targetSessions,
      stageTarget: lastStage.targetSessions,
      subStage: 'blooming',
      subStageLabel: '盛放期',
      allBloomed: true,
      progressRatio: 1,
    };
  }

  const currentStage =
    FLOWER_STAGES.find(
      (s) => clamped >= s.cumulativeStart && clamped < s.cumulativeEnd
    ) || FLOWER_STAGES[0];

  const sessionsInStage = clamped - currentStage.cumulativeStart;
  const ratio = sessionsInStage / currentStage.targetSessions;

  let subStage: GrowthSubStage = 'seedling';
  let subStageLabel = '初芽期';

  if (clamped === 0) {
    subStage = 'seedling';
    subStageLabel = '初芽期';
  } else if (ratio < 0.22) {
    subStage = 'seedling';
    subStageLabel = '初芽期';
  } else if (ratio < 0.58) {
    subStage = 'stemming';
    subStageLabel = '抽枝期';
  } else if (ratio < 0.9) {
    subStage = 'budding';
    subStageLabel = '含苞期';
  } else {
    subStage = 'blooming';
    subStageLabel = '初绽期';
  }

  return {
    stage: currentStage,
    sessionsInStage,
    stageTarget: currentStage.targetSessions,
    subStage,
    subStageLabel,
    allBloomed: false,
    progressRatio: ratio,
  };
}

export interface YesterdayFeedback {
  type: 'first_day' | 'met' | 'partial' | 'missed_mist' | 'rested';
  message: string;
  showMorningMist: boolean;
}

export function getYesterdayFeedback(state: AppState): YesterdayFeedback {
  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();
  const yRec = state.recordsByDate[yesterdayKey];
  const target = getDailyTarget(state.rhythmMode);

  // Brand new user on day 1 with zero history before today
  const hasAnyPreviousDay =
    state.startedDate < todayKey ||
    Object.keys(state.recordsByDate).some((k) => k < todayKey);

  if (!hasAnyPreviousDay && state.totalKegelSessions === 0) {
    return {
      type: 'first_day',
      message: '',
      showMorningMist: false,
    };
  }

  if (yRec?.isRestDay && yRec.kegelCount === 0) {
    return {
      type: 'rested',
      message: '昨天给自己放了温柔小假，小芽也一起舒舒服服地蓄满力啦',
      showMorningMist: false,
    };
  }

  const yCount = yRec?.kegelCount ?? 0;
  if (yCount === 0) {
    return {
      type: 'missed_mist',
      message: '昨天带娃辛苦啦，小芽也陪你好好睡了一觉',
      showMorningMist: true,
    };
  }

  if (yCount < target) {
    return {
      type: 'partial',
      message: `昨天给小芽晒了 ${yCount} 次太阳，它已经稳稳扎根啦`,
      showMorningMist: false,
    };
  }

  return {
    type: 'met',
    message: `昨天温柔滋养了 ${yCount} 次，叶片今天看起来格外舒展`,
    showMorningMist: false,
  };
}

/**
 * Checks whether the past 3 consecutive days (excluding today) were below target
 * and none of them were marked as rest days, and user is not already on light mode.
 */
export function shouldSuggestLoweringRhythm(state: AppState): boolean {
  if (state.rhythmMode === 'light') return false;
  const todayKey = getTodayKey();
  if (state.lastLowTargetPromptDate === todayKey) return false;

  const threeDaysAgoKey = formatDateKey(addDays(new Date(), -3));
  if (state.startedDate > threeDaysAgoKey) return false;

  const target = getDailyTarget(state.rhythmMode);
  for (let i = 1; i <= 3; i++) {
    const k = formatDateKey(addDays(new Date(), -i));
    const rec = state.recordsByDate[k];
    if (rec?.isRestDay) return false;
    if ((rec?.kegelCount ?? 0) >= target) return false;
  }
  return true;
}

/**
 * Demo/Preview state builders inside the Rhythm sheet so users can inspect
 * every zero-guilt state & botanical stage cleanly.
 */
export function buildPreviewState(
  scenario:
    | 'fresh'
    | 'partial_yesterday'
    | 'missed_mist'
    | 'busy_3days'
    | 'bloom_daisy'
    | 'full_garden'
): AppState {
  const today = new Date();
  const todayKey = formatDateKey(today);
  const d1 = formatDateKey(addDays(today, -1));
  const d2 = formatDateKey(addDays(today, -2));
  const d3 = formatDateKey(addDays(today, -3));
  const d4 = formatDateKey(addDays(today, -4));
  const d5 = formatDateKey(addDays(today, -5));

  if (scenario === 'fresh') {
    return createInitialState();
  }

  if (scenario === 'partial_yesterday') {
    return {
      rhythmMode: 'standard',
      totalKegelSessions: 4,
      startedDate: d5,
      lastLowTargetPromptDate: null,
      pendingBloomStage: null,
      unlockedSpecimens: [],
      reflections: {},
      recordsByDate: {
        [d3]: { date: d3, kegelCount: 2, relaxCount: 0, isRestDay: false, totalMinutes: 4, flowerId: 'daisy' },
        [d2]: { date: d2, kegelCount: 1, relaxCount: 1, isRestDay: false, totalMinutes: 4, flowerId: 'daisy' },
        [d1]: { date: d1, kegelCount: 1, relaxCount: 0, isRestDay: false, totalMinutes: 2, flowerId: 'daisy' },
      },
    };
  }

  if (scenario === 'missed_mist') {
    return {
      rhythmMode: 'balanced',
      totalKegelSessions: 6,
      startedDate: d5,
      lastLowTargetPromptDate: null,
      pendingBloomStage: null,
      unlockedSpecimens: [],
      reflections: {},
      recordsByDate: {
        [d4]: { date: d4, kegelCount: 2, relaxCount: 0, isRestDay: false, totalMinutes: 4, flowerId: 'daisy' },
        [d3]: { date: d3, kegelCount: 2, relaxCount: 0, isRestDay: false, totalMinutes: 4, flowerId: 'daisy' },
        [d2]: { date: d2, kegelCount: 2, relaxCount: 1, isRestDay: false, totalMinutes: 6, flowerId: 'daisy' },
      },
    };
  }

  if (scenario === 'busy_3days') {
    return {
      rhythmMode: 'standard',
      totalKegelSessions: 5,
      startedDate: d5,
      lastLowTargetPromptDate: null,
      pendingBloomStage: null,
      unlockedSpecimens: [],
      reflections: {},
      recordsByDate: {
        [d4]: { date: d4, kegelCount: 3, relaxCount: 0, isRestDay: false, totalMinutes: 6, flowerId: 'daisy' },
        [d3]: { date: d3, kegelCount: 1, relaxCount: 0, isRestDay: false, totalMinutes: 2, flowerId: 'daisy' },
        [d2]: { date: d2, kegelCount: 0, relaxCount: 1, isRestDay: false, totalMinutes: 2, flowerId: 'daisy' },
        [d1]: { date: d1, kegelCount: 1, relaxCount: 0, isRestDay: false, totalMinutes: 2, flowerId: 'daisy' },
      },
    };
  }

  if (scenario === 'bloom_daisy') {
    return {
      rhythmMode: 'balanced',
      totalKegelSessions: 14,
      startedDate: formatDateKey(addDays(today, -14)),
      lastLowTargetPromptDate: null,
      pendingBloomStage: 'daisy',
      unlockedSpecimens: [
        {
          flowerId: 'daisy',
          bloomedAt: todayKey,
          weeksAccompanied: '第 1–2 周',
        },
      ],
      reflections: {},
      recordsByDate: {
        [d4]: { date: d4, kegelCount: 2, relaxCount: 0, isRestDay: false, totalMinutes: 4, flowerId: 'daisy' },
        [d3]: { date: d3, kegelCount: 0, relaxCount: 0, isRestDay: true, totalMinutes: 0, flowerId: 'daisy' },
        [d2]: { date: d2, kegelCount: 2, relaxCount: 1, isRestDay: false, totalMinutes: 6, flowerId: 'daisy' },
        [d1]: { date: d1, kegelCount: 2, relaxCount: 0, isRestDay: false, totalMinutes: 4, flowerId: 'daisy' },
        [todayKey]: { date: todayKey, kegelCount: 1, relaxCount: 0, isRestDay: false, totalMinutes: 2, flowerId: 'daisy' },
      },
    };
  }

  // full_garden (12 weeks complete)
  const records: Record<string, DayRecord> = {};
  const flowerByOffset = (i: number): FlowerId => {
    if (i > 12) return 'daisy';
    if (i > 7) return 'chamomile';
    if (i > 3) return 'tulip';
    return 'lily';
  };
  for (let i = 16; i >= 0; i--) {
    const key = formatDateKey(addDays(today, -i));
    if (i === 11 || i === 5) {
      records[key] = {
        date: key,
        kegelCount: 0,
        relaxCount: 0,
        isRestDay: true,
        totalMinutes: 0,
        flowerId: flowerByOffset(i),
      };
    } else if (i !== 8) {
      records[key] = {
        date: key,
        kegelCount: i % 3 === 0 ? 1 : 2,
        relaxCount: i % 4 === 0 ? 1 : 0,
        isRestDay: false,
        totalMinutes: i % 3 === 0 ? 3 : 6,
        flowerId: flowerByOffset(i),
      };
    }
  }

  return {
    rhythmMode: 'balanced',
    totalKegelSessions: 84,
    startedDate: formatDateKey(addDays(today, -84)),
    lastLowTargetPromptDate: null,
    pendingBloomStage: 'lily',
    unlockedSpecimens: [
      { flowerId: 'daisy', bloomedAt: formatDateKey(addDays(today, -70)), weeksAccompanied: '第 1–2 周' },
      { flowerId: 'chamomile', bloomedAt: formatDateKey(addDays(today, -42)), weeksAccompanied: '第 3–6 周' },
      { flowerId: 'tulip', bloomedAt: formatDateKey(addDays(today, -14)), weeksAccompanied: '第 7–10 周' },
      { flowerId: 'lily', bloomedAt: todayKey, weeksAccompanied: '第 11–12 周' },
    ],
    reflections: {
      daisy: { stageId: 'daisy', feeling: 'slight', date: formatDateKey(addDays(today, -70)) },
      chamomile: { stageId: 'chamomile', feeling: 'better', date: formatDateKey(addDays(today, -42)) },
      tulip: { stageId: 'tulip', feeling: 'better', date: formatDateKey(addDays(today, -14)) },
    },
    recordsByDate: records,
  };
}
