import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { FLOWER_STAGES, getStageById } from '../data/curriculum';
import { AppState, DayRecord, ShareCardPayload } from '../types/app';
import { formatDateKey, getPlantProgress, getTodayKey } from '../utils/storage';
import { PressedSpecimenSvg } from './PressedSpecimenSvg';

interface JournalPageProps {
  state: AppState;
  onOpenShareCard: (payload: ShareCardPayload) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export const JournalPage: React.FC<JournalPageProps> = ({
  state,
  onOpenShareCard,
}) => {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0..11

  const progress = getPlantProgress(state.totalKegelSessions);
  const todayKey = getTodayKey();
  const todayRecord = state.recordsByDate[todayKey];

  // Build calendar cells for current viewYear / viewMonth
  const calendarData = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startOffset = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: (null | { day: number; key: string; record?: DayRecord })[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);

    let practicedDays = 0;
    let restDays = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDateKey(new Date(viewYear, viewMonth, d));
      const rec = state.recordsByDate[key];
      if (rec) {
        if (rec.kegelCount > 0 || rec.relaxCount > 0) practicedDays++;
        else if (rec.isRestDay) restDays++;
      }
      cells.push({ day: d, key, record: rec });
    }

    return { cells, practicedDays, restDays };
  }, [viewYear, viewMonth, state.recordsByDate]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const formatDisplayDate = (dateKey: string) => {
    const [y, m, d] = dateKey.split('-');
    return `${y}.${m}.${d}`;
  };

  const handleDayClick = (key: string, rec?: DayRecord) => {
    if (!rec) return;
    const stage = getStageById(rec.flowerId || progress.stage.id);
    onOpenShareCard({
      flowerId: stage.id,
      flowerName: stage.name,
      dateLabel: formatDisplayDate(key),
      minutes: rec.totalMinutes || stage.estimatedMinutes,
      isRestDay: rec.isRestDay && rec.kegelCount === 0 && rec.relaxCount === 0,
    });
  };

  const handleOpenTodayCard = () => {
    const rec = todayRecord;
    const stage = getStageById(rec?.flowerId || progress.stage.id);
    onOpenShareCard({
      flowerId: stage.id,
      flowerName: stage.name,
      dateLabel: formatDisplayDate(todayKey),
      minutes: rec?.totalMinutes || stage.estimatedMinutes,
      isRestDay: Boolean(
        rec?.isRestDay && rec.kegelCount === 0 && rec.relaxCount === 0
      ),
    });
  };

  return (
    <div className="px-5 pt-5 pb-24 space-y-7">
      {/* Header */}
      <header className="flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-xs text-[#8C8177]">复苏手账 · Herbarium</p>
          <h1 className="mt-1 font-serif-editorial text-[22px] font-medium text-[#4A433D]">
            干花图鉴与花期日历
          </h1>
        </div>

        <button
          type="button"
          onClick={handleOpenTodayCard}
          className="min-h-[44px] px-3.5 rounded-2xl bg-[#FFFDF9] border border-[#4A433D]/10 text-xs font-medium text-[#5C534B] hover:border-[#8FA998]/50 active:scale-[0.97] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Share2 className="w-3.5 h-3.5 text-[#8FA998]" />
          <span>今日日签</span>
        </button>
      </header>

      {/* Section 1: Pressed Flower Herbarium Wall */}
      <section aria-labelledby="herbarium-heading">
        <div className="flex items-baseline justify-between px-1 mb-3">
          <h2
            id="herbarium-heading"
            className="font-serif-editorial text-[16px] font-medium text-[#4A433D]"
          >
            干花标本墙
          </h2>
          <span className="text-xs text-[#8C8177] tabular-nums">
            已压制 {state.unlockedSpecimens.length} / 4 株
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {FLOWER_STAGES.map((stage) => {
            const specimen = state.unlockedSpecimens.find(
              (s) => s.flowerId === stage.id
            );
            const isUnlocked = Boolean(specimen);
            const isCurrent =
              !isUnlocked && progress.stage.id === stage.id && !progress.allBloomed;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => {
                  if (isUnlocked && specimen) {
                    onOpenShareCard({
                      flowerId: stage.id,
                      flowerName: stage.name,
                      dateLabel: formatDisplayDate(specimen.bloomedAt),
                      minutes: stage.estimatedMinutes,
                      isSpecimen: true,
                      weeksLabel: stage.weeksLabel,
                      flowerLanguage: stage.flowerLanguage,
                    });
                  }
                }}
                disabled={!isUnlocked}
                className={`relative text-left p-4 rounded-3xl border transition-all duration-200 flex flex-col items-center ${
                  isUnlocked
                    ? 'bg-[#FFFDF9] border-[#4A433D]/10 hover:border-[#D9A7A7]/60 active:scale-[0.985] cursor-pointer shadow-[0_6px_18px_-10px_rgba(74,67,61,0.14)]'
                    : 'bg-[#FAF6EE]/70 border-[#4A433D]/[0.06] cursor-default'
                }`}
              >
                <PressedSpecimenSvg
                  flowerId={stage.id}
                  unlocked={isUnlocked}
                  className="w-[88px] h-[100px]"
                />

                <div className="mt-2 text-center w-full">
                  <div className="font-serif-editorial text-[15px] font-medium text-[#4A433D]">
                    {stage.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#8C8177]">
                    {stage.weeksLabel}
                  </div>

                  {isUnlocked ? (
                    <p className="mt-1.5 text-[11px] leading-relaxed text-[#6E645B] line-clamp-2">
                      {stage.flowerLanguage}
                    </p>
                  ) : isCurrent ? (
                    <p className="mt-1.5 text-[11px] text-[#5C7666] tabular-nums">
                      正在滋养 · {progress.sessionsInStage}/{progress.stageTarget} 次
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-[#A89E94]">
                      静待下一段花期
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 2: Watercolor Journal Calendar (Zero red crosses) */}
      <section aria-labelledby="calendar-heading">
        <div className="flex items-center justify-between px-1 mb-3">
          <h2
            id="calendar-heading"
            className="font-serif-editorial text-[16px] font-medium text-[#4A433D]"
          >
            手账日历
          </h2>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="上一个月"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#756B62] hover:bg-[#4A433D]/5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-[#4A433D] tabular-nums px-1">
              {viewYear} 年 {viewMonth + 1} 月
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="下一个月"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#756B62] hover:bg-[#4A433D]/5 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#FFFDF9] border border-[#4A433D]/10">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="text-center text-[11px] text-[#9C9288] py-1"
              >
                {w}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-1.5">
            {calendarData.cells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-10" />;
              }

              const rec = cell.record;
              const isToday = cell.key === todayKey;
              const hasKegel = Boolean(rec && rec.kegelCount > 0);
              const hasRelaxOnly = Boolean(
                rec && rec.kegelCount === 0 && rec.relaxCount > 0
              );
              const isRest = Boolean(
                rec && rec.isRestDay && !hasKegel && !hasRelaxOnly
              );
              const isInteractive = hasKegel || hasRelaxOnly || isRest;

              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={!isInteractive}
                  onClick={() => handleDayClick(cell.key, rec)}
                  className={`relative h-10 flex flex-col items-center justify-center rounded-2xl transition-all ${
                    isInteractive
                      ? 'cursor-pointer hover:bg-[#FAF7F2] active:scale-95'
                      : 'cursor-default'
                  }`}
                >
                  {/* Soft watercolor circle wash for practiced days */}
                  {hasKegel && (
                    <span
                      aria-hidden="true"
                      className="absolute w-8 h-8 rounded-full"
                      style={{
                        backgroundColor:
                          (rec?.kegelCount ?? 0) >= 2
                            ? 'rgba(217, 167, 167, 0.42)'
                            : 'rgba(143, 169, 152, 0.36)',
                        borderRadius: '48% 52% 46% 54% / 52% 46% 54% 48%',
                      }}
                    />
                  )}

                  {hasRelaxOnly && (
                    <span
                      aria-hidden="true"
                      className="absolute w-8 h-8 rounded-full bg-[#E8C696]/35"
                      style={{
                        borderRadius: '54% 46% 52% 48% / 48% 54% 46% 52%',
                      }}
                    />
                  )}

                  {isRest ? (
                    <div className="flex flex-col items-center">
                      <svg
                        viewBox="0 0 28 18"
                        className="w-6 h-4"
                        aria-label="休息日小云朵"
                      >
                        <path
                          d="M6 15 C3 15 2 11 5 9.5 C6 5.5 11.5 4 15 7 C17.5 5.5 22 7 22 10 C25 10.5 25.5 15 22 15 Z"
                          fill="#E2ECE5"
                          stroke="#8FA998"
                          strokeWidth="1.3"
                        />
                      </svg>
                      <span className="text-[10px] leading-none text-[#756B62] tabular-nums mt-0.5">
                        {cell.day}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`relative z-10 text-xs tabular-nums ${
                        isToday
                          ? 'font-semibold text-[#4A433D] underline decoration-[#8FA998] decoration-2 underline-offset-4'
                          : hasKegel || hasRelaxOnly
                            ? 'font-medium text-[#4A433D]'
                            : 'text-[#8C8177]'
                      }`}
                    >
                      {cell.day}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Gentle unboxed calendar legend & summary */}
          <div className="mt-4 pt-3 border-t border-[#4A433D]/[0.07] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8C8177]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8FA998]/60 inline-block" />
                已滋养
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9A7A7]/65 inline-block" />
                多次呵护
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E2ECE5] border border-[#8FA998] inline-block" />
                休息小云朵
              </span>
            </div>

            <span className="tabular-nums text-[#6E645B]">
              本月滋养 {calendarData.practicedDays} 天 · 休息 {calendarData.restDays} 天
            </span>
          </div>
        </div>

        <p className="mt-2.5 px-1 text-[11px] text-[#9C9288] text-center">
          轻点任意水彩圆点或小云朵，即可生成当日暗号日签
        </p>
      </section>
    </div>
  );
};
