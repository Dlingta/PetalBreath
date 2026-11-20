export type FlowerId = 'daisy' | 'chamomile' | 'tulip' | 'lily';

export type RhythmMode = 'light' | 'balanced' | 'standard';

export type TabView = 'home' | 'journal';

export type PracticeKind = 'kegel' | 'relax';

export type GrowthSubStage = 'seedling' | 'stemming' | 'budding' | 'blooming';

export type ExercisePhaseType =
  | 'calibration'
  | 'slow_contract'
  | 'slow_hold'
  | 'slow_relax'
  | 'quick_contract'
  | 'quick_relax'
  | 'pre_cue'
  | 'relax_inhale'
  | 'relax_exhale';

export interface FlowerStageConfig {
  id: FlowerId;
  stageIndex: number; // 0..3
  name: string;
  englishName: string;
  weeksLabel: string;
  posture: string;
  phaseTitle: string;
  targetSessions: number; // sessions needed within this stage to bloom
  cumulativeStart: number; // sessions completed before entering this stage
  cumulativeEnd: number; // total sessions when this stage blooms
  flowerLanguage: string;
  storyNote: string;
  accentColor: string;
  petalPrimary: string;
  petalSecondary: string;
  centerColor: string;
  // Daily exercise protocol (seconds)
  slowContractSec: number;
  slowHoldSec: number;
  slowRelaxSec: number;
  slowSets: number;
  quickContractSec: number;
  quickRelaxSec: number;
  quickSets: number;
  hasPreContractionCue: boolean;
  estimatedMinutes: number;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  kegelCount: number;
  relaxCount: number;
  isRestDay: boolean;
  totalMinutes: number;
  flowerId: FlowerId;
}

export interface ReflectionAnswer {
  stageId: FlowerId;
  feeling: 'better' | 'slight' | 'none';
  date: string;
}

export interface UnlockedSpecimen {
  flowerId: FlowerId;
  bloomedAt: string; // YYYY-MM-DD
  weeksAccompanied: string;
}

export interface AppState {
  rhythmMode: RhythmMode;
  totalKegelSessions: number;
  recordsByDate: Record<string, DayRecord>;
  unlockedSpecimens: UnlockedSpecimen[];
  reflections: Partial<Record<FlowerId, ReflectionAnswer>>;
  lastLowTargetPromptDate: string | null;
  pendingBloomStage: FlowerId | null;
  startedDate: string; // YYYY-MM-DD
}

export interface ShareCardPayload {
  flowerId: FlowerId;
  flowerName: string;
  dateLabel: string;
  minutes: number;
  isRestDay?: boolean;
  isSpecimen?: boolean;
  weeksLabel?: string;
  flowerLanguage?: string;
}
