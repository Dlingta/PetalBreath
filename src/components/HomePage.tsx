import React, { useEffect, useState } from 'react';
import { CloudRain, SlidersHorizontal, Wind } from 'lucide-react';
import {
  getTimeGreeting,
  ICEBREAKER_PROTOCOL,
  RHYTHM_OPTIONS,
} from '../data/curriculum';
import { AppState, PracticeKind } from '../types/app';
import { haptics, loadVibrationPreference } from '../utils/haptics';
import {
  getPlantProgress,
  getTodayKey,
  getYesterdayFeedback,
} from '../utils/storage';
import { BotanicalPot } from './BotanicalPot';

interface HomePageProps {
  state: AppState;
  onStartPractice: (kind: PracticeKind) => void;
  onMarkRestDay: () => void;
  onOpenRhythmSheet: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  state,
  onStartPractice,
  onMarkRestDay,
  onOpenRhythmSheet,
}) => {
  const [rainActive, setRainActive] = useState(false);
  const [justRestedToast, setJustRestedToast] = useState(false);

  const greeting = getTimeGreeting();
  const progress = getPlantProgress(state.totalKegelSessions);
  const yesterdayFeedback = getYesterdayFeedback(state);
  const todayKey = getTodayKey();
  const todayRecord = state.recordsByDate[todayKey];
  const isTodayRested = Boolean(todayRecord?.isRestDay);
  const isBrandNew = state.totalKegelSessions === 0;
  const currentRhythm = RHYTHM_OPTIONS.find((r) => r.id === state.rhythmMode);

  useEffect(() => {
    if (!rainActive) return;
    const t = setTimeout(() => setRainActive(false), 4500);
    return () => clearTimeout(t);
  }, [rainActive]);

  const handleRestClick = () => {
    setRainActive(true);
    setJustRestedToast(true);
    if (loadVibrationPreference()) {
      haptics.restRain();
    }
    onMarkRestDay();
  };

  // Gentle contextual whisper line (strictly zero-guilt)
  let whisperMessage = '';
  if (justRestedToast || isTodayRested) {
    whisperMessage = '今天好好休息，也是在蓄力呀';
  } else if (todayRecord && todayRecord.kegelCount > 0) {
    whisperMessage = `今天已温柔滋养 ${todayRecord.kegelCount} 次，谢谢你照顾自己`;
  } else if (todayRecord && todayRecord.relaxCount > 0) {
    whisperMessage = '今天用腹式呼吸安抚了身体，感觉轻松一点了吗';
  } else if (yesterdayFeedback.message) {
    whisperMessage = yesterdayFeedback.message;
  }

  const showMorningMist =
    yesterdayFeedback.showMorningMist &&
    !isTodayRested &&
    !rainActive &&
    (!todayRecord || (todayRecord.kegelCount === 0 && todayRecord.relaxCount === 0));

  const primaryBtnTitle = isBrandNew
    ? ICEBREAKER_PROTOCOL.title
    : `开始本次唤醒 · 约 ${progress.stage.estimatedMinutes} 分钟`;

  return (
    <div className="flex flex-col min-h-full px-6 pt-5 pb-24">
      {/* Top Greeting & Rhythm Trigger */}
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-[#8C8177]">
            <span>{greeting.period}</span>
            <span aria-hidden="true">·</span>
            <span>{currentRhythm?.label}</span>
          </div>
          <h1 className="mt-1.5 font-serif-editorial text-[21px] leading-[1.4] font-medium text-[#4A433D] [text-wrap:balance]">
            {greeting.headline}
          </h1>
        </div>

        <button
          type="button"
          onClick={onOpenRhythmSheet}
          aria-label="生长节奏设置"
          className="min-h-[44px] min-w-[44px] shrink-0 flex items-center justify-center gap-1.5 px-3 rounded-2xl bg-[#FFFDF9]/85 border border-[#4A433D]/10 text-[#5C534B] hover:bg-[#FFFDF9] active:scale-[0.97] transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#8FA998]" />
          <span className="text-xs font-medium whitespace-nowrap">节奏</span>
        </button>
      </header>

      {/* Zero-guilt gentle whisper note */}
      <div className="min-h-[28px] mt-3">
        {whisperMessage && (
          <p className="text-[13px] leading-relaxed text-[#6E645B] transition-opacity duration-500">
            {whisperMessage}
          </p>
        )}
      </div>

      {/* Central Visual Anchor: Potted Botanical Illustration */}
      <section className="flex-1 flex flex-col items-center justify-center my-2">
        <div className="w-[248px] h-[256px] sm:w-[264px] sm:h-[272px] flex items-center justify-center">
          <BotanicalPot
            flowerId={progress.stage.id}
            subStage={progress.subStage}
            isBrandNew={isBrandNew}
            dampSoil={isTodayRested || rainActive}
            showRain={rainActive}
            showRestStamp={isTodayRested}
            showMorningMist={showMorningMist}
            className="w-full h-full"
          />
        </div>

        {/* Unboxed Poetic Progress Caption (No percentages, no pills) */}
        <div className="mt-2 text-center max-w-[300px]">
          {isBrandNew ? (
            <>
              <p className="font-serif-editorial text-[16px] text-[#4A433D]">
                一切恢复，都从这颗小芽开始
              </p>
              <p className="mt-1.5 text-xs text-[#8C8177] tabular-nums">
                {progress.stage.name} · {progress.subStageLabel} · {progress.stage.posture}
              </p>
            </>
          ) : (
            <>
              <p className="font-serif-editorial text-[16px] text-[#4A433D] tabular-nums">
                {progress.stage.name}
                <span className="mx-1.5 text-[#C5B9AC]" aria-hidden="true">·</span>
                {progress.subStageLabel}
                <span className="mx-1.5 text-[#C5B9AC]" aria-hidden="true">·</span>
                {progress.allBloomed
                  ? '12 周花期已盛放'
                  : `已滋养 ${progress.sessionsInStage}/${progress.stageTarget} 次`}
              </p>

              {/* Soft organic watercolor stem progress hairline */}
              {!progress.allBloomed && (
                <div
                  className="mx-auto mt-2.5 w-44 h-1.5 rounded-full bg-[#4A433D]/[0.07] overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-[#8FA998] transition-all duration-700 ease-in-out"
                    style={{
                      width: `${Math.max(8, Math.round(progress.progressRatio * 100))}%`,
                    }}
                  />
                </div>
              )}

              <p className="mt-2 text-xs text-[#8C8177]">
                {progress.stage.weeksLabel} · {progress.stage.posture} · {progress.stage.phaseTitle}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Bottom Thumb-Zone Action Controls */}
      <section className="mt-4 space-y-3">
        {/* Primary Action CTA */}
        <button
          type="button"
          onClick={() => onStartPractice('kegel')}
          className="w-full min-h-[56px] px-6 py-3.5 rounded-3xl bg-[#8FA998] hover:bg-[#829D8B] text-[#FFFDF9] font-medium text-[15px] tracking-wide shadow-[0_8px_22px_-6px_rgba(143,169,152,0.55)] active:scale-[0.985] transition-all duration-200 cursor-pointer flex items-center justify-center whitespace-nowrap"
        >
          {primaryBtnTitle}
        </button>

        {/* Two Gentle Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onStartPractice('relax')}
            className="min-h-[58px] px-3.5 py-2.5 rounded-3xl bg-[#FFFDF9] border border-[#4A433D]/10 hover:border-[#8FA998]/50 active:scale-[0.985] transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center"
          >
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#4A433D] whitespace-nowrap">
              <Wind className="w-3.5 h-3.5 text-[#8FA998] shrink-0" />
              纯放松 · 腹式呼吸
            </span>
            <span className="mt-0.5 text-[11px] text-[#8C8177] whitespace-nowrap">
              2 分钟 · 舒缓助眠
            </span>
          </button>

          <button
            type="button"
            onClick={handleRestClick}
            className={`min-h-[58px] px-3.5 py-2.5 rounded-3xl border active:scale-[0.985] transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center ${
              isTodayRested
                ? 'bg-[#EDF3EE] border-[#8FA998]/35'
                : 'bg-[#FFFDF9] border-[#4A433D]/10 hover:border-[#D9A7A7]/60'
            }`}
          >
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#4A433D] whitespace-nowrap">
              <CloudRain className="w-3.5 h-3.5 text-[#9B6B6B] shrink-0" />
              {isTodayRested ? '今天好好休息' : '今天太累了'}
            </span>
            <span className="mt-0.5 text-[11px] text-[#8C8177] whitespace-nowrap">
              {isTodayRested ? '已盖休息小云朵' : '落一场温柔小雨'}
            </span>
          </button>
        </div>
      </section>
    </div>
  );
};
