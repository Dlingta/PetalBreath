import React, { useState } from 'react';
import { getStageById } from '../data/curriculum';
import { FlowerId } from '../types/app';
import { PressedSpecimenSvg } from './PressedSpecimenSvg';

interface BusyRhythmModalProps {
  open: boolean;
  onAcceptLight: () => void;
  onKeepCurrent: () => void;
}

/**
 * Triggered gently when 3 consecutive days were below target.
 * Zero guilt — warmly suggests easing into 1x/day light mode.
 */
export const BusyRhythmModal: React.FC<BusyRhythmModalProps> = ({
  open,
  onAcceptLight,
  onKeepCurrent,
}) => {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-5 bg-[#4A433D]/28 backdrop-blur-[2px]">
      <div
        className="w-full max-w-[340px] rounded-3xl bg-[#FAF7F2] p-6 shadow-2xl border border-[#4A433D]/10 text-center"
        role="dialog"
        aria-modal="true"
        aria-label="节奏轻柔调整建议"
      >
        <div className="mx-auto w-14 h-14 rounded-full bg-[#EDF3EE] flex items-center justify-center mb-4">
          <svg viewBox="0 0 40 40" className="w-8 h-8">
            <path
              d="M20 32 Q19 22 20 14"
              stroke="#8FA998"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M20 16 C12 12 9 6 14 4 C19 4 21 11 20 16 Z"
              fill="#A5B89E"
            />
            <path
              d="M20 16 C28 12 31 6 26 4 C21 4 19 11 20 16 Z"
              fill="#8FA998"
            />
          </svg>
        </div>

        <h3 className="font-serif-editorial text-[18px] font-medium text-[#4A433D] [text-wrap:balance]">
          最近是不是特别忙？
        </h3>
        <p className="mt-2.5 text-[13px] leading-relaxed text-[#6E645B]">
          带娃的日子本来就充满突发状况，小芽一点也不着急。要不要先把节奏调成「轻盈模式 · 每天 1 次」，更轻松一点？
        </p>

        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={onAcceptLight}
            className="w-full min-h-[48px] rounded-3xl bg-[#8FA998] hover:bg-[#829D8B] text-[#FFFDF9] text-sm font-medium transition-colors cursor-pointer"
          >
            好的，先调成每天 1 次
          </button>
          <button
            type="button"
            onClick={onKeepCurrent}
            className="w-full min-h-[44px] rounded-3xl text-xs text-[#8C8177] hover:text-[#4A433D] transition-colors cursor-pointer"
          >
            先保持现在的节奏就好
          </button>
        </div>
      </div>
    </div>
  );
};

interface BloomReflectionModalProps {
  flowerId: FlowerId | null;
  onSubmit: (flowerId: FlowerId, feeling: 'better' | 'slight' | 'none') => void;
  onClose: () => void;
}

/**
 * 10-second gentle somatic reflection shown when a flower completes blooming.
 * If 12 weeks (lily) are completed with 'none', shows gentle non-alarmist clinic evaluation guidance.
 */
export const BloomReflectionModal: React.FC<BloomReflectionModalProps> = ({
  flowerId,
  onSubmit,
  onClose,
}) => {
  const [selected, setSelected] = useState<'better' | 'slight' | 'none' | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!flowerId) return null;

  const stage = getStageById(flowerId);
  const isFull12Weeks = flowerId === 'lily';

  const handleChoose = (feeling: 'better' | 'slight' | 'none') => {
    setSelected(feeling);
    setSubmitted(true);
    onSubmit(flowerId, feeling);
  };

  const handleDone = () => {
    setSelected(null);
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-5 bg-[#4A433D]/32 backdrop-blur-[2px]">
      <div
        className="w-full max-w-[348px] rounded-3xl bg-[#FAF7F2] p-6 shadow-2xl border border-[#4A433D]/10 text-center"
        role="dialog"
        aria-modal="true"
        aria-label="花期盛放体感小复盘"
      >
        <div className="mx-auto flex justify-center mb-2">
          <PressedSpecimenSvg
            flowerId={flowerId}
            unlocked={true}
            className="w-24 h-28"
          />
        </div>

        <p className="text-xs text-[#8FA998] font-medium">
          {stage.name}已盛放并压入干花图鉴
        </p>

        {!submitted ? (
          <>
            <h3 className="mt-1.5 font-serif-editorial text-[18px] font-medium text-[#4A433D] [text-wrap:balance]">
              10 秒体感小复盘
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[#6E645B]">
              最近大笑、咳嗽或抱娃起身时，感觉身体更稳了吗？
            </p>

            <div className="mt-5 space-y-2.5">
              {[
                { id: 'better', label: '感觉更稳、更有托举感了' },
                { id: 'slight', label: '有一点点温和的变化' },
                { id: 'none', label: '暂时还没有明显感觉' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    handleChoose(opt.id as 'better' | 'slight' | 'none')
                  }
                  className="w-full min-h-[46px] px-4 rounded-2xl bg-[#FFFDF9] border border-[#4A433D]/10 hover:border-[#8FA998] text-[13px] font-medium text-[#4A433D] transition-all active:scale-[0.985] cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="mt-1.5 font-serif-editorial text-[18px] font-medium text-[#4A433D]">
              {isFull12Weeks && selected === 'none'
                ? '谢谢你的诚实记录'
                : '每一份感受都很珍贵'}
            </h3>

            {isFull12Weeks && selected === 'none' ? (
              <p className="mt-2.5 text-[13px] leading-relaxed text-[#6E645B] text-left bg-[#FFFDF9] p-4 rounded-2xl border border-[#4A433D]/10">
                你已经非常棒地坚持走完了 12 周完整花期。每位妈妈的产后恢复个体差异很大，如果目前依然感到漏尿、坠胀或改善不明显，建议抽空到医院妇产科或盆底康复门诊做一次温和的专业评估，让康复师为你提供更针对性的支持。
              </p>
            ) : (
              <p className="mt-2.5 text-[13px] leading-relaxed text-[#6E645B]">
                {selected === 'better'
                  ? '真替你开心！这份悄悄长出来的力量，正稳稳托住日常的每一个瞬间。'
                  : selected === 'slight'
                    ? '细微的感知就是复苏的信号，继续按自己的步调慢慢滋养就好。'
                    : '身体深层的肌纤维恢复需要耐心，如果练习时觉得腹部或大腿发紧，下次可以多做几次腹式呼吸放松再轻提哦。'}
              </p>
            )}

            <button
              type="button"
              onClick={handleDone}
              className="mt-5 w-full min-h-[48px] rounded-3xl bg-[#8FA998] hover:bg-[#829D8B] text-[#FFFDF9] text-sm font-medium transition-colors cursor-pointer"
            >
              收下这枚干花标本
            </button>
          </>
        )}
      </div>
    </div>
  );
};
