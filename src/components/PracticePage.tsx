import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CloudRain,
  Pause,
  Play,
  Vibrate,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  ANTI_COMPENSATION_TIPS,
  ICEBREAKER_PROTOCOL,
  POST_PRACTICE_PRAISES,
  PURE_RELAX_PROTOCOL,
  RELAX_PRACTICE_PRAISES,
} from '../data/curriculum';
import {
  ExercisePhaseType,
  FlowerStageConfig,
  GrowthSubStage,
  PracticeKind,
} from '../types/app';
import {
  haptics,
  loadVibrationPreference,
  saveVibrationPreference,
} from '../utils/haptics';
import { soundEngine } from '../utils/soundEngine';
import { BotanicalPot } from './BotanicalPot';
import { BreathingFlower } from './BreathingFlower';

interface PracticeStep {
  phase: ExercisePhaseType;
  durationSec: number;
  label: string;
  subHint: string;
  setNumber?: number;
  totalSets?: number;
  sectionLabel?: string;
}

interface PracticePageProps {
  kind: PracticeKind;
  stage: FlowerStageConfig;
  isFirstEver: boolean;
  nextSubStageAfterCompletion: GrowthSubStage;
  nextSessionsInStage: number;
  stageTarget: number;
  onExit: () => void;
  onComplete: (minutesSpent: number) => void;
  onOpenTodayShareCard: () => void;
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export const PracticePage: React.FC<PracticePageProps> = ({
  kind,
  stage,
  isFirstEver,
  nextSubStageAfterCompletion,
  nextSessionsInStage,
  stageTarget,
  onExit,
  onComplete,
  onOpenTodayShareCard,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rainEnabled, setRainEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(() =>
    loadVibrationPreference()
  );
  const [unsupportedHint, setUnsupportedHint] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepElapsedSec, setStepElapsedSec] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [growthPulse, setGrowthPulse] = useState(false);

  const hasRecordedCompletionRef = useRef(false);
  const lastCueStepRef = useRef<number>(-1);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  const vibrationEnabledRef = useRef(vibrationEnabled);
  vibrationEnabledRef.current = vibrationEnabled;

  // Build ordered exercise timeline
  const steps = useMemo<PracticeStep[]>(() => {
    const list: PracticeStep[] = [];

    if (kind === 'relax') {
      list.push({
        phase: 'calibration',
        durationSec: 6,
        label: '先放松下来',
        subHint: '轻轻闭眼或垂眸，把一只手温柔放在小腹上',
        sectionLabel: '练前安顿',
      });
      for (let i = 1; i <= PURE_RELAX_PROTOCOL.cycles; i++) {
        list.push({
          phase: 'relax_inhale',
          durationSec: PURE_RELAX_PROTOCOL.inhaleSec,
          label: '吸气 · 腹部柔和鼓起',
          subHint: '像温热的风慢慢充盈整个腹腔',
          setNumber: i,
          totalSets: PURE_RELAX_PROTOCOL.cycles,
          sectionLabel: '腹式深呼吸',
        });
        list.push({
          phase: 'relax_exhale',
          durationSec: PURE_RELAX_PROTOCOL.exhaleSec,
          label: '呼气 · 彻底松开',
          subHint: '沉下肩膀，松开下巴与骨盆底',
          setNumber: i,
          totalSets: PURE_RELAX_PROTOCOL.cycles,
          sectionLabel: '腹式深呼吸',
        });
      }
      return list;
    }

    // Kegel practice: 10s anti-compensation calibration first
    list.push({
      phase: 'calibration',
      durationSec: 10,
      label: '防代偿校准',
      subHint: `建议姿势：${stage.posture}`,
      sectionLabel: '练前准备',
    });

    if (isFirstEver) {
      // 1-minute icebreaker
      for (let i = 1; i <= ICEBREAKER_PROTOCOL.slowSets; i++) {
        list.push({
          phase: 'slow_contract',
          durationSec: ICEBREAKER_PROTOCOL.slowContractSec,
          label: '呼气 · 轻提',
          subHint: '像花瓣缓缓聚拢，只用温和的三分力',
          setNumber: i,
          totalSets: ICEBREAKER_PROTOCOL.slowSets,
          sectionLabel: '初次唤醒',
        });
        list.push({
          phase: 'slow_relax',
          durationSec: ICEBREAKER_PROTOCOL.slowRelaxSec,
          label: '吸气 · 彻底松开',
          subHint: '花瓣完全舒展，小腹和大腿保持柔软',
          setNumber: i,
          totalSets: ICEBREAKER_PROTOCOL.slowSets,
          sectionLabel: '初次唤醒',
        });
      }
      return list;
    }

    // Standard stage slow muscle sets
    for (let i = 1; i <= stage.slowSets; i++) {
      list.push({
        phase: 'slow_contract',
        durationSec: stage.slowContractSec,
        label: '呼气 · 轻提',
        subHint: '花瓣缓缓聚拢，感受温和上提的暖意',
        setNumber: i,
        totalSets: stage.slowSets,
        sectionLabel: '慢肌滋养',
      });
      if (stage.slowHoldSec > 0) {
        list.push({
          phase: 'slow_hold',
          durationSec: stage.slowHoldSec,
          label: '稳住 · 保持',
          subHint: '不要憋气，保持轻柔呼吸与肩腹放松',
          setNumber: i,
          totalSets: stage.slowSets,
          sectionLabel: '慢肌滋养',
        });
      }
      list.push({
        phase: 'slow_relax',
        durationSec: stage.slowRelaxSec,
        label: '吸气 · 彻底松开',
        subHint: '花瓣彻底摊开，把全部重量交给大地',
        setNumber: i,
        totalSets: stage.slowSets,
        sectionLabel: '慢肌滋养',
      });
    }

    // Stage 2-4 fast muscle alternating sets
    if (stage.quickSets > 0) {
      list.push({
        phase: 'pre_cue',
        durationSec: 4,
        label: '轻快收放准备',
        subHint: '接下来跟随花瓣轻快地 1 秒轻收、1 秒松开',
        sectionLabel: '快肌弹性',
      });
      for (let i = 1; i <= stage.quickSets; i++) {
        list.push({
          phase: 'quick_contract',
          durationSec: stage.quickContractSec,
          label: '轻收',
          subHint: '轻快向内收拢',
          setNumber: i,
          totalSets: stage.quickSets,
          sectionLabel: '快肌弹性',
        });
        list.push({
          phase: 'quick_relax',
          durationSec: stage.quickRelaxSec,
          label: '松开',
          subHint: '立即轻盈放开',
          setNumber: i,
          totalSets: stage.quickSets,
          sectionLabel: '快肌弹性',
        });
      }
    }

    // Stage 4 real-life pre-contraction mindfulness prompt
    if (stage.hasPreContractionCue) {
      list.push({
        phase: 'pre_cue',
        durationSec: 6,
        label: '生活预收缩小贴士',
        subHint: '日常大笑、咳嗽或抱起宝宝前，先轻轻吐气微提一下哦',
        sectionLabel: '生活化巩固',
      });
    }

    return list;
  }, [kind, stage, isFirstEver]);

  const estimatedMinutes =
    kind === 'relax'
      ? PURE_RELAX_PROTOCOL.estimatedMinutes
      : isFirstEver
        ? ICEBREAKER_PROTOCOL.estimatedMinutes
        : stage.estimatedMinutes;

  const praiseMessage = useMemo(() => {
    const pool = kind === 'relax' ? RELAX_PRACTICE_PRAISES : POST_PRACTICE_PRAISES;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [kind]);

  // Manage ambient rain & vibration cleanup lifecycle
  useEffect(() => {
    soundEngine.setRainAmbience(rainEnabled);
    return () => {
      soundEngine.stopRain();
      haptics.cancel();
    };
  }, [rainEnabled]);

  // Cancel any active vibration when paused
  useEffect(() => {
    if (isPaused) {
      haptics.cancel();
    }
  }, [isPaused]);

  const handleToggleVibration = () => {
    setVibrationEnabled((prev) => {
      const next = !prev;
      saveVibrationPreference(next);
      if (next) {
        if (haptics.isSupported()) {
          haptics.toggleConfirm();
        } else {
          setUnsupportedHint(true);
          setTimeout(() => setUnsupportedHint(false), 3000);
        }
      } else {
        haptics.cancel();
      }
      return next;
    });
  };

  // Trigger audio + haptic cues when step changes
  useEffect(() => {
    if (completed || isPaused) return;
    if (lastCueStepRef.current === stepIndex) return;
    lastCueStepRef.current = stepIndex;

    const step = steps[stepIndex];
    if (!step) return;

    if (soundEnabledRef.current) {
      if (step.phase === 'slow_contract') {
        soundEngine.playSingingBowl(Math.max(2.0, step.durationSec * 0.9));
      } else if (step.phase === 'slow_relax') {
        soundEngine.playWaterDrop();
      } else if (step.phase === 'quick_contract') {
        soundEngine.playSoftPulse(true);
      } else if (step.phase === 'quick_relax') {
        soundEngine.playSoftPulse(false);
      } else if (step.phase === 'relax_inhale') {
        soundEngine.playWaterDrop(0.12);
      } else if (step.phase === 'relax_exhale' && (step.setNumber ?? 1) % 2 === 1) {
        soundEngine.playSingingBowl(3.2, 0.1);
      }
    }

    if (vibrationEnabledRef.current) {
      if (step.phase === 'slow_contract') {
        haptics.slowContract();
      } else if (step.phase === 'slow_hold') {
        haptics.slowHold();
      } else if (step.phase === 'slow_relax') {
        haptics.slowRelax();
      } else if (step.phase === 'quick_contract') {
        haptics.quickContract();
      } else if (step.phase === 'quick_relax') {
        haptics.quickRelax();
      } else if (step.phase === 'relax_inhale') {
        haptics.relaxInhale();
      } else if (step.phase === 'relax_exhale') {
        haptics.relaxExhale();
      }
    }
  }, [stepIndex, completed, isPaused, steps]);

  // Smooth requestAnimationFrame timer loop
  useEffect(() => {
    if (completed || isPaused) return;

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      setStepElapsedSec((prev) => {
        const currentStep = steps[stepIndex];
        if (!currentStep) return prev;
        const next = prev + dt;
        if (next >= currentStep.durationSec) {
          if (stepIndex + 1 < steps.length) {
            setStepIndex((idx) => idx + 1);
            return 0;
          } else {
            // Completed full session!
            setCompleted(true);
            return currentStep.durationSec;
          }
        }
        return next;
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [completed, isPaused, stepIndex, steps]);

  // Handle completion side effects once
  useEffect(() => {
    if (!completed || hasRecordedCompletionRef.current) return;
    hasRecordedCompletionRef.current = true;
    soundEngine.stopRain();
    if (soundEnabledRef.current) {
      soundEngine.playBloomChime();
    }
    if (vibrationEnabledRef.current) {
      haptics.bloomComplete();
    }
    onComplete(estimatedMinutes);
    const t = setTimeout(() => setGrowthPulse(true), 450);
    return () => clearTimeout(t);
  }, [completed, estimatedMinutes, onComplete]);

  // Compute organic openness, warm glow, and pulse for the BreathingFlower
  const currentStep = steps[stepIndex] || steps[steps.length - 1];
  const progress = Math.min(1, stepElapsedSec / Math.max(0.01, currentStep.durationSec));
  const eased = easeInOutSine(progress);

  let openness = 1;
  let glow = 0.08;
  let pulse = 0;

  switch (currentStep.phase) {
    case 'calibration':
    case 'pre_cue':
      openness = 0.96 + Math.sin(stepElapsedSec * 1.4) * 0.04;
      glow = 0.12 + Math.sin(stepElapsedSec * 1.4) * 0.05;
      break;
    case 'slow_contract':
      openness = 1 - eased;
      glow = 0.1 + eased * 0.85;
      break;
    case 'slow_hold':
      openness = 0.02;
      glow = 0.92 + Math.sin(stepElapsedSec * 4.2) * 0.08;
      pulse = Math.sin(stepElapsedSec * 4.2) * 0.5 + 0.5;
      break;
    case 'slow_relax':
      openness = eased;
      glow = (1 - eased) * 0.85;
      break;
    case 'quick_contract':
      openness = 1 - eased * 0.88;
      glow = 0.15 + eased * 0.72;
      break;
    case 'quick_relax':
      openness = 0.12 + eased * 0.88;
      glow = (1 - eased) * 0.72;
      break;
    case 'relax_inhale':
      openness = 0.48 + eased * 0.52;
      glow = 0.15 + eased * 0.4;
      break;
    case 'relax_exhale':
      openness = 1 - eased * 0.52;
      glow = 0.55 - eased * 0.4;
      break;
  }

  // Rotating anti-compensation cue during calibration
  const calibrationTipIndex = Math.floor(stepElapsedSec / 3.3) % ANTI_COMPENSATION_TIPS.length;
  const remainingSec = Math.max(1, Math.ceil(currentStep.durationSec - stepElapsedSec));

  const handleSkipCalibration = () => {
    if (currentStep.phase === 'calibration' && stepIndex + 1 < steps.length) {
      setStepIndex(stepIndex + 1);
      setStepElapsedSec(0);
    }
  };

  // === POST-PRACTICE RITUAL VIEW ===
  if (completed) {
    return (
      <div className="flex flex-col min-h-full px-6 py-8 justify-between bg-[#FAF7F2]">
        <div className="text-center pt-4">
          <p className="text-xs text-[#8FA998] font-medium tracking-wider">
            {kind === 'relax' ? '温柔舒展完成' : '本次滋养已落下'}
          </p>
          <h2 className="mt-2 font-serif-editorial text-[22px] text-[#4A433D] [text-wrap:balance]">
            {kind === 'relax'
              ? '身体变得轻盈了一点点'
              : '阳光与露珠，正在滋养你的小花'}
          </h2>
        </div>

        {/* Potted plant receiving sunlight & dew drops and gently perking up */}
        <div className="flex flex-col items-center my-4">
          <div className="w-[248px] h-[256px]">
            <BotanicalPot
              flowerId={stage.id}
              subStage={nextSubStageAfterCompletion}
              isBrandNew={false}
              showSunDew={true}
              growthPulse={growthPulse}
              className="w-full h-full"
            />
          </div>

          <p className="mt-3 font-serif-editorial text-[15px] leading-relaxed text-[#4A433D] text-center max-w-[280px]">
            {praiseMessage}
          </p>

          <p className="mt-2 text-xs text-[#8C8177] tabular-nums">
            {kind === 'relax'
              ? `腹式呼吸放松 · ${estimatedMinutes} 分钟`
              : `${stage.name} · 已温柔滋养 ${Math.min(nextSessionsInStage, stageTarget)} / ${stageTarget} 次`}
          </p>
        </div>

        <div className="space-y-3 pb-2">
          <button
            type="button"
            onClick={onExit}
            className="w-full min-h-[54px] rounded-3xl bg-[#8FA998] hover:bg-[#829D8B] text-[#FFFDF9] font-medium text-[15px] shadow-[0_8px_22px_-6px_rgba(143,169,152,0.5)] active:scale-[0.985] transition-all cursor-pointer"
          >
            回到花园
          </button>

          <button
            type="button"
            onClick={onOpenTodayShareCard}
            className="w-full min-h-[48px] rounded-3xl bg-[#FFFDF9] border border-[#4A433D]/12 text-[#5C534B] text-sm font-medium hover:bg-[#F5EFE6] active:scale-[0.985] transition-all cursor-pointer"
          >
            生成今日暗号日签
          </button>
        </div>
      </div>
    );
  }

  // === ACTIVE GUIDED BREATHING SANCTUARY ===
  return (
    <div className="flex flex-col min-h-full px-6 pt-5 pb-8 justify-between bg-[#FAF7F2]">
      {/* Minimalist Top Controls: Exit + Rain / Singing Bowl / Vibration Toggles */}
      <header className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.stopRain();
            haptics.cancel();
            onExit();
          }}
          className="min-h-[44px] min-w-[44px] -ml-2 px-2 flex items-center gap-1 text-sm text-[#756B62] hover:text-[#4A433D] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <X className="w-4 h-4" />
          <span>退出</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRainEnabled((v) => !v)}
            aria-label={rainEnabled ? '关闭雨声白噪音' : '开启雨声白噪音'}
            aria-pressed={rainEnabled}
            className={`min-h-[44px] px-2.5 rounded-2xl border text-xs font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              rainEnabled
                ? 'bg-[#E9F0EB] border-[#8FA998]/45 text-[#556E5E]'
                : 'bg-[#FFFDF9]/80 border-[#4A433D]/10 text-[#7A7067]'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>雨声</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            aria-label={soundEnabled ? '关闭引导音效' : '开启引导音效'}
            aria-pressed={soundEnabled}
            className={`min-h-[44px] px-2.5 rounded-2xl border text-xs font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              soundEnabled
                ? 'bg-[#F6EDE0] border-[#E8C696]/60 text-[#7A5E35]'
                : 'bg-[#FFFDF9]/80 border-[#4A433D]/10 text-[#9C9288]'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span>{soundEnabled ? '颂钵' : '静音'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleVibration}
            aria-label={vibrationEnabled ? '关闭手机振动提示' : '开启手机振动提示'}
            aria-pressed={vibrationEnabled}
            className={`min-h-[44px] px-2.5 rounded-2xl border text-xs font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              vibrationEnabled
                ? 'bg-[#F5E8E7] border-[#D9A7A7]/60 text-[#875252]'
                : 'bg-[#FFFDF9]/80 border-[#4A433D]/10 text-[#9C9288]'
            }`}
          >
            <Vibrate className="w-3.5 h-3.5" />
            <span>振动</span>
          </button>
        </div>
      </header>

      {/* Gentle whisper if current desktop/iOS browser lacks Web Vibration API */}
      {unsupportedHint && (
        <p className="text-center text-[11px] text-[#8C8177] mt-1 transition-opacity">
          当前设备浏览器暂不支持网页振动，手机端支持触觉引导
        </p>
      )}

      {/* Quiet Section & Set Progress */}
      <div className="text-center mt-2">
        <div className="text-xs text-[#8C8177] tabular-nums">
          <span>{currentStep.sectionLabel}</span>
          {currentStep.setNumber && currentStep.totalSets && (
            <>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>
                第 {currentStep.setNumber} / {currentStep.totalSets} 组
              </span>
            </>
          )}
        </div>
        {/* Thin calm progress line across session */}
        <div className="mx-auto mt-2.5 w-32 h-1 rounded-full bg-[#4A433D]/[0.07] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#8FA998] transition-all duration-500 ease-in-out"
            style={{
              width: `${Math.round(((stepIndex + progress) / steps.length) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Central Breathing Flower Sanctuary */}
      <div className="flex-1 flex flex-col items-center justify-center my-2">
        <BreathingFlower
          flowerId={stage.id}
          openness={openness}
          glow={glow}
          pulse={pulse}
          isPureRelax={kind === 'relax'}
        />

        {/* Dynamic Breathing Guidance Prompt */}
        <div className="mt-5 text-center px-2 min-h-[104px] flex flex-col items-center">
          <h2 className="font-serif-editorial text-[26px] font-medium text-[#4A433D] tracking-wide transition-all duration-300">
            {currentStep.label}
          </h2>

          <p className="mt-2 text-sm text-[#756B62] leading-relaxed max-w-[290px] transition-opacity duration-500">
            {currentStep.phase === 'calibration' && kind === 'kegel'
              ? ANTI_COMPENSATION_TIPS[calibrationTipIndex]
              : currentStep.subHint}
          </p>

          <p className="mt-2.5 text-xs text-[#9C9288] tabular-nums">
            {currentStep.phase === 'calibration' && kind === 'kegel'
              ? `${stage.posture} · ${remainingSec} 秒后开始`
              : `${remainingSec} 秒`}
          </p>
        </div>
      </div>

      {/* Calm Bottom Pause / Skip Calibration Controls */}
      <footer className="flex items-center justify-center gap-4 pt-2">
        {currentStep.phase === 'calibration' ? (
          <button
            type="button"
            onClick={handleSkipCalibration}
            className="min-h-[46px] px-6 rounded-3xl bg-[#FFFDF9] border border-[#4A433D]/12 text-sm text-[#6E645B] hover:bg-[#F5EFE6] transition-colors cursor-pointer"
          >
            准备好了，直接开始
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className="min-h-[48px] px-6 rounded-3xl bg-[#FFFDF9] border border-[#4A433D]/12 text-sm font-medium text-[#4A433D] flex items-center gap-2 hover:bg-[#F5EFE6] active:scale-[0.98] transition-all cursor-pointer"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 text-[#8FA998]" />
                  <span>继续呼吸</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 text-[#8C8177]" />
                  <span>暂歇一下</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCompleted(true)}
              className="min-h-[48px] px-4 rounded-3xl text-xs text-[#8C8177] hover:text-[#4A433D] transition-colors cursor-pointer"
            >
              提前收尾
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};
