import { FlowerId, FlowerStageConfig, RhythmMode } from '../types/app';

export const RHYTHM_OPTIONS: {
  id: RhythmMode;
  label: string;
  dailyTarget: number;
  shortDesc: string;
  detail: string;
}[] = [
  {
    id: 'light',
    label: '轻盈模式',
    dailyTarget: 1,
    shortDesc: '每天 1 次',
    detail: '适合刚起步或带娃忙碌的日子，每天留 2–3 分钟就很好。',
  },
  {
    id: 'balanced',
    label: '平衡模式',
    dailyTarget: 2,
    shortDesc: '每天 2 次',
    detail: '早晚各一次温柔唤醒，轻松建立稳定节律。',
  },
  {
    id: 'standard',
    label: '标准模式',
    dailyTarget: 3,
    shortDesc: '每天 3 次',
    detail: '循序渐进的标准陪伴节奏，随时可以无负担回调。',
  },
];

export const FLOWER_STAGES: FlowerStageConfig[] = [
  {
    id: 'daisy',
    stageIndex: 0,
    name: '小雏菊',
    englishName: 'Daisy',
    weeksLabel: '第 1–2 周',
    posture: '仰卧屈膝',
    phaseTitle: '唤醒与防代偿期',
    targetSessions: 14,
    cumulativeStart: 0,
    cumulativeEnd: 14,
    flowerLanguage: '静静扎根，微小的力量也能托起春天',
    storyNote: '从最轻柔的觉察开始，重新认识身体深处那份安静的支撑感。',
    accentColor: '#E8C696',
    petalPrimary: '#FFFDF8',
    petalSecondary: '#F2E3C9',
    centerColor: '#E8C696',
    slowContractSec: 3,
    slowHoldSec: 1,
    slowRelaxSec: 5,
    slowSets: 8,
    quickContractSec: 0,
    quickRelaxSec: 0,
    quickSets: 0,
    hasPreContractionCue: false,
    estimatedMinutes: 2,
  },
  {
    id: 'chamomile',
    stageIndex: 1,
    name: '洋甘菊',
    englishName: 'Chamomile',
    weeksLabel: '第 3–6 周',
    posture: '舒适坐姿',
    phaseTitle: '肌力建立期',
    targetSessions: 28,
    cumulativeStart: 14,
    cumulativeEnd: 42,
    flowerLanguage: '越是柔软的耐力，越能温柔抵御风雨',
    storyNote: '慢呼吸延展韧性，轻快的收放唤醒弹性，像洋甘菊一样淡定从容。',
    accentColor: '#E4BA7B',
    petalPrimary: '#FAF4E8',
    petalSecondary: '#E8C696',
    centerColor: '#D9A76A',
    slowContractSec: 4,
    slowHoldSec: 1,
    slowRelaxSec: 6,
    slowSets: 10,
    quickContractSec: 1,
    quickRelaxSec: 1,
    quickSets: 10,
    hasPreContractionCue: false,
    estimatedMinutes: 3,
  },
  {
    id: 'tulip',
    stageIndex: 2,
    name: '郁金香',
    englishName: 'Tulip',
    weeksLabel: '第 7–10 周',
    posture: '放松站姿',
    phaseTitle: '抗重力强化期',
    targetSessions: 28,
    cumulativeStart: 42,
    cumulativeEnd: 70,
    flowerLanguage: '亭亭舒展，站着也能感受到向上的暖意',
    storyNote: '在站立中迎着重力轻柔上提，花瓣层层包拢，给予身体踏实依靠。',
    accentColor: '#D9A7A7',
    petalPrimary: '#DFB0AE',
    petalSecondary: '#C88D8D',
    centerColor: '#E8C696',
    slowContractSec: 5,
    slowHoldSec: 2,
    slowRelaxSec: 8,
    slowSets: 10,
    quickContractSec: 1,
    quickRelaxSec: 1,
    quickSets: 12,
    hasPreContractionCue: false,
    estimatedMinutes: 4,
  },
  {
    id: 'lily',
    stageIndex: 3,
    name: '铃兰',
    englishName: 'Lily of the Valley',
    weeksLabel: '第 11–12 周',
    posture: '站立动态',
    phaseTitle: '生活化巩固期',
    targetSessions: 14,
    cumulativeStart: 70,
    cumulativeEnd: 84,
    flowerLanguage: '幸福归来，每一次转身与大笑都轻盈自在',
    storyNote: '把轻柔的预收缩融入抱娃、起身与欢笑里，让从容成为身体的本能。',
    accentColor: '#8FA998',
    petalPrimary: '#F7EFE8',
    petalSecondary: '#E2C0BA',
    centerColor: '#E8C696',
    slowContractSec: 6,
    slowHoldSec: 2,
    slowRelaxSec: 10,
    slowSets: 10,
    quickContractSec: 1,
    quickRelaxSec: 1,
    quickSets: 15,
    hasPreContractionCue: true,
    estimatedMinutes: 4,
  },
];

export const ICEBREAKER_PROTOCOL = {
  title: '1 分钟体验 · 唤醒小芽',
  slowContractSec: 2,
  slowHoldSec: 0,
  slowRelaxSec: 4,
  slowSets: 6,
  estimatedMinutes: 1,
};

export const PURE_RELAX_PROTOCOL = {
  title: '纯放松 · 腹式呼吸课',
  inhaleSec: 4,
  exhaleSec: 6,
  cycles: 12, // 12 * 10s = 120s (2 minutes)
  estimatedMinutes: 2,
};

export const ANTI_COMPENSATION_TIPS = [
  '放松肩膀、小腹和大腿，不要憋气哦',
  '把力气轻轻收在身体最深处，像花瓣缓缓合拢',
  '臀部保持柔软，脸颊和下巴也一起松开',
  '呼气时温柔轻提，吸气时把全部重量交给地面',
];

export const POST_PRACTICE_PRAISES = [
  '今天的温柔托举，小芽都悄悄记在心里啦。',
  '谢谢你在忙碌的缝隙里，把这几分钟留给了自己。',
  '一呼一吸之间，身体正在按自己的节奏慢慢复苏。',
  '不必追求完美，每一次安静感受，都是最好的滋养。',
  '阳光和水珠刚刚落下，小花又稳稳扎深了一点点。',
];

export const RELAX_PRACTICE_PRAISES = [
  '肩膀和心事都一起松开了，今晚一定会睡个好觉。',
  '学会彻底松开，和积蓄力量一样重要呀。',
  '让呼吸慢下来，身体就会知道此刻非常安全。',
];

export const CODED_SHARE_QUOTES = [
  '今天也温柔地托住了自己',
  '在忙碌的缝隙里，留了一朵花开的时间',
  '不疾不徐，和身体一起慢慢扎根',
  '把呼吸放轻，把温柔还给自己',
  '静静滋养，静待属于我的花期',
];

export const REST_DAY_SHARE_QUOTES = [
  '今天允许自己慢下来，也是在温柔蓄力',
  '窗外落着温柔小雨，和自己一起歇一歇',
];

export function getStageById(id: FlowerId): FlowerStageConfig {
  return FLOWER_STAGES.find((s) => s.id === id) || FLOWER_STAGES[0];
}

export function getTimeGreeting(date = new Date()): {
  period: string;
  headline: string;
} {
  const h = date.getHours();
  if (h >= 5 && h < 9) {
    return {
      period: '清晨微光',
      headline: '早安，用 2 分钟温柔唤醒身体吧',
    };
  }
  if (h >= 9 && h < 12) {
    return {
      period: '上午时光',
      headline: '趁阳光正好，给自己一点舒展的留白',
    };
  }
  if (h >= 12 && h < 17) {
    return {
      period: '午后暖阳',
      headline: '午后 3 分钟，给自己一点留白',
    };
  }
  if (h >= 17 && h < 21) {
    return {
      period: '傍晚微风',
      headline: '忙碌了一天，回来听听自己的呼吸',
    };
  }
  return {
    period: '静谧夜晚',
    headline: '夜深了，轻柔舒展后安心入睡吧',
  };
}
