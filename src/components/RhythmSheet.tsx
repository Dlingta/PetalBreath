import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { FLOWER_STAGES, RHYTHM_OPTIONS } from '../data/curriculum';
import { RhythmMode } from '../types/app';

interface RhythmSheetProps {
  open: boolean;
  currentMode: RhythmMode;
  totalKegelSessions: number;
  onSelectMode: (mode: RhythmMode) => void;
  onLoadPreview: (
    scenario:
      | 'fresh'
      | 'partial_yesterday'
      | 'missed_mist'
      | 'busy_3days'
      | 'bloom_daisy'
      | 'full_garden'
  ) => void;
  onClose: () => void;
}

export const RhythmSheet: React.FC<RhythmSheetProps> = ({
  open,
  currentMode,
  totalKegelSessions,
  onSelectMode,
  onLoadPreview,
  onClose,
}) => {
  const [showPreviewTools, setShowPreviewTools] = useState(false);

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-[#4A433D]/25 backdrop-blur-[2px] transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[86%] overflow-y-auto no-scrollbar rounded-t-[32px] bg-[#FAF7F2] px-6 pt-3 pb-8 shadow-2xl border-t border-[#4A433D]/10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="生长节奏设置"
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-[#4A433D]/15 mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif-editorial text-[18px] font-medium text-[#4A433D]">
              生长节奏设置
            </h2>
            <p className="text-xs text-[#8C8177] mt-0.5">
              植物只会慢慢长大，随时可以无负担调整节奏
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-full text-[#8C8177] hover:text-[#4A433D] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Rhythm Modes */}
        <div className="space-y-2.5">
          {RHYTHM_OPTIONS.map((opt) => {
            const active = currentMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectMode(opt.id)}
                className={`w-full text-left p-4 rounded-3xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  active
                    ? 'bg-[#FFFDF9] border-[#8FA998] shadow-[0_6px_16px_-10px_rgba(143,169,152,0.5)]'
                    : 'bg-[#FFFDF9]/65 border-[#4A433D]/10 hover:bg-[#FFFDF9]'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-medium text-[#4A433D]">
                      {opt.label}
                    </span>
                    <span className="text-xs text-[#5C7666]">
                      {opt.shortDesc}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#756B62]">
                    {opt.detail}
                  </p>
                </div>

                <span
                  className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    active
                      ? 'bg-[#8FA998] text-[#FFFDF9]'
                      : 'border border-[#4A433D]/20'
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* 12-Week 4-Flower Roadmap Overview */}
        <div className="mt-6 pt-5 border-t border-[#4A433D]/[0.08]">
          <h3 className="font-serif-editorial text-[15px] font-medium text-[#4A433D]">
            12 周四段花期旅程
          </h3>
          <div className="mt-3 space-y-2.5">
            {FLOWER_STAGES.map((s) => {
              const reached = totalKegelSessions >= s.cumulativeEnd;
              const active =
                totalKegelSessions >= s.cumulativeStart &&
                totalKegelSessions < s.cumulativeEnd;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 py-1.5 text-xs"
                >
                  <div className="min-w-0">
                    <span
                      className={`font-medium ${
                        reached || active ? 'text-[#4A433D]' : 'text-[#9C9288]'
                      }`}
                    >
                      {s.name}
                    </span>
                    <span className="mx-1.5 text-[#C5B9AC]" aria-hidden="true">·</span>
                    <span className="text-[#8C8177]">{s.weeksLabel}</span>
                    <span className="mx-1.5 text-[#C5B9AC]" aria-hidden="true">·</span>
                    <span className="text-[#8C8177]">{s.posture}</span>
                  </div>
                  <span className="shrink-0 tabular-nums text-[#756B62]">
                    {reached
                      ? '已盛放'
                      : active
                        ? `${totalKegelSessions - s.cumulativeStart}/${s.targetSessions} 次`
                        : `${s.targetSessions} 次盛放`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unobtrusive collapsible scenario preview for instant testing */}
        <div className="mt-6 pt-4 border-t border-[#4A433D]/[0.08]">
          <button
            type="button"
            onClick={() => setShowPreviewTools((v) => !v)}
            className="w-full min-h-[44px] flex items-center justify-between text-xs text-[#8C8177] hover:text-[#4A433D] cursor-pointer"
          >
            <span>体验不同日常状态（演示预览）</span>
            {showPreviewTools ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showPreviewTools && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { id: 'fresh', label: '新用户小芽 (0次)' },
                { id: 'partial_yesterday', label: '昨日部分完成' },
                { id: 'missed_mist', label: '昨日未练 · 薄雾' },
                { id: 'busy_3days', label: '连忙3天降频提示' },
                { id: 'bloom_daisy', label: '小雏菊盛放复盘' },
                { id: 'full_garden', label: '12周全图鉴盛放' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onLoadPreview(
                      item.id as
                        | 'fresh'
                        | 'partial_yesterday'
                        | 'missed_mist'
                        | 'busy_3days'
                        | 'bloom_daisy'
                        | 'full_garden'
                    );
                    onClose();
                  }}
                  className="min-h-[40px] px-3 py-2 rounded-2xl bg-[#FFFDF9] border border-[#4A433D]/10 text-[11px] text-[#5C534B] hover:border-[#8FA998] transition-colors cursor-pointer text-center"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
