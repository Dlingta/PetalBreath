import React, { useState } from 'react';
import { Download, RefreshCw, X } from 'lucide-react';
import { CODED_SHARE_QUOTES, REST_DAY_SHARE_QUOTES } from '../data/curriculum';
import { ShareCardPayload } from '../types/app';
import { downloadShareCardPng } from '../utils/shareCardCanvas';
import { PressedSpecimenSvg } from './PressedSpecimenSvg';

interface ShareCardModalProps {
  payload: ShareCardPayload | null;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  payload,
  onClose,
}) => {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!payload) return null;

  const quotePool = payload.isRestDay ? REST_DAY_SHARE_QUOTES : CODED_SHARE_QUOTES;
  const activeQuote = quotePool[quoteIdx % quotePool.length];

  const handleCycleQuote = () => {
    setQuoteIdx((i) => (i + 1) % quotePool.length);
  };

  const handleSave = () => {
    downloadShareCardPng({
      flowerId: payload.flowerId,
      flowerName: payload.flowerName,
      quote: activeQuote,
      dateLabel: payload.dateLabel,
      minutes: payload.minutes,
      isRestDay: payload.isRestDay,
      weeksLabel: payload.weeksLabel,
      flowerLanguage: payload.flowerLanguage,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2400);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-5 bg-[#4A433D]/35 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[348px] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="暗号式日签分享卡片"
      >
        {/* Top close button */}
        <div className="w-full flex justify-end mb-2.5">
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭日签"
            className="min-h-[44px] min-w-[44px] rounded-full bg-[#FAF7F2]/90 text-[#5C534B] flex items-center justify-center shadow-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Watercolor Share Card Visual Preview (Strictly De-medicalized) */}
        <div className="w-full rounded-3xl watercolor-paper p-6 shadow-2xl border border-[#4A433D]/12 relative overflow-hidden">
          {/* Inner archival border */}
          <div className="rounded-2xl border border-[#4A433D]/10 px-5 py-6 flex flex-col items-center text-center bg-[#FFFDF9]/55">
            {/* Top date & brand */}
            <div className="w-full flex items-center justify-between text-[11px] text-[#8C8177]">
              <span className="tabular-nums">{payload.dateLabel}</span>
              <span className="font-serif-editorial text-[#5C7666]">
                花息 · PetalBreath
              </span>
            </div>

            {/* Illustration medallion */}
            <div className="my-6 w-36 h-36 rounded-full bg-[#FFFDF9]/90 border border-dashed border-[#8FA998]/35 flex items-center justify-center relative">
              {payload.isRestDay ? (
                <svg viewBox="0 0 120 110" className="w-24 h-24">
                  <path
                    d="M28 66 C18 66 15 52 26 48 C28 33 48 27 60 37 C69 32 86 37 86 48 C96 50 96 66 84 66 Z"
                    fill="#E5EFE8"
                    stroke="#8FA998"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                  {[38, 56, 74].map((x, i) => (
                    <ellipse
                      key={i}
                      cx={x}
                      cy={82 + (i % 2) * 5}
                      rx="2.5"
                      ry="5.5"
                      fill="#8FA998"
                      opacity="0.75"
                    />
                  ))}
                </svg>
              ) : (
                <PressedSpecimenSvg
                  flowerId={payload.flowerId}
                  unlocked={true}
                  className="w-24 h-28"
                />
              )}
            </div>

            {/* Poetic coded copy — ZERO medical terms */}
            <p className="font-serif-editorial text-[17px] leading-[1.55] text-[#4A433D] [text-wrap:balance]">
              {activeQuote}
              {!payload.isRestDay && payload.minutes > 0 && (
                <span className="text-[#8FA998] tabular-nums">
                  {' '}
                  · {payload.minutes} min
                </span>
              )}
            </p>

            <p className="mt-2.5 text-xs text-[#7A7067] leading-relaxed">
              {payload.flowerLanguage
                ? `${payload.flowerName} · ${payload.flowerLanguage}`
                : payload.isRestDay
                  ? '今天好好休息，也是在蓄力呀'
                  : `${payload.flowerName}花期 · 一呼一吸，温柔相伴`}
            </p>

            <div className="w-12 h-[1px] bg-[#4A433D]/12 my-4" />

            <p className="text-[10px] text-[#9C9288]">
              {payload.weeksLabel
                ? `陪伴手账 · ${payload.weeksLabel}`
                : '不慌不忙 · 与自己静静相守'}
            </p>
          </div>
        </div>

        {/* Actions below card */}
        <div className="w-full mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCycleQuote}
            className="min-h-[48px] px-4 rounded-3xl bg-[#FAF7F2]/95 text-[#5C534B] text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#FFFDF9] active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#8FA998]" />
            <span>换一句暗号</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 min-h-[48px] px-5 rounded-3xl bg-[#8FA998] hover:bg-[#829D8B] text-[#FFFDF9] text-sm font-medium flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{savedNotice ? '已保存水彩日签' : '保存日签图片'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
