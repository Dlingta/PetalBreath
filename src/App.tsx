import React, { useCallback, useEffect, useState } from 'react';
import { BookOpen, Flower2, Sprout } from 'lucide-react';
import { FLOWER_STAGES } from './data/curriculum';
import {
  AppState,
  FlowerId,
  PracticeKind,
  RhythmMode,
  ShareCardPayload,
  TabView,
} from './types/app';
import {
  buildPreviewState,
  getPlantProgress,
  getTodayKey,
  loadAppState,
  saveAppState,
  shouldSuggestLoweringRhythm,
} from './utils/storage';
import { BloomReflectionModal, BusyRhythmModal } from './components/GentleModals';
import { HomePage } from './components/HomePage';
import { JournalPage } from './components/JournalPage';
import { PracticePage } from './components/PracticePage';
import { RhythmSheet } from './components/RhythmSheet';
import { ShareCardModal } from './components/ShareCardModal';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<TabView>('home');
  const [activeSession, setActiveSession] = useState<{
    kind: PracticeKind;
    stageId: FlowerId;
    isFirstEver: boolean;
  } | null>(null);
  const [rhythmSheetOpen, setRhythmSheetOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState<ShareCardPayload | null>(null);
  const [showBusyModal, setShowBusyModal] = useState(false);

  // Persist to LocalStorage on any state change
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Check for 3-consecutive-days-below-target gentle suggestion
  useEffect(() => {
    if (!activeSession && shouldSuggestLoweringRhythm(state)) {
      const timer = setTimeout(() => setShowBusyModal(true), 600);
      return () => clearTimeout(timer);
    }
  }, [state, activeSession]);

  const progress = getPlantProgress(state.totalKegelSessions);

  const handleStartPractice = useCallback(
    (kind: PracticeKind) => {
      const curr = getPlantProgress(state.totalKegelSessions);
      setActiveSession({
        kind,
        stageId: curr.stage.id,
        isFirstEver: state.totalKegelSessions === 0,
      });
    },
    [state.totalKegelSessions]
  );

  const handleSelectRhythm = useCallback((mode: RhythmMode) => {
    setState((prev) => ({ ...prev, rhythmMode: mode }));
  }, []);

  const handleMarkRestDay = useCallback(() => {
    const todayKey = getTodayKey();
    setState((prev) => {
      const currProgress = getPlantProgress(prev.totalKegelSessions);
      const existing = prev.recordsByDate[todayKey];
      return {
        ...prev,
        recordsByDate: {
          ...prev.recordsByDate,
          [todayKey]: {
            date: todayKey,
            kegelCount: existing?.kegelCount ?? 0,
            relaxCount: existing?.relaxCount ?? 0,
            isRestDay: true,
            totalMinutes: existing?.totalMinutes ?? 0,
            flowerId: existing?.flowerId ?? currProgress.stage.id,
          },
        },
      };
    });
  }, []);

  const handlePracticeComplete = useCallback(
    (minutesSpent: number) => {
      const todayKey = getTodayKey();
      const kind = activeSession?.kind || 'kegel';

      setState((prev) => {
        const beforeProgress = getPlantProgress(prev.totalKegelSessions);
        const nextTotal =
          kind === 'kegel' ? prev.totalKegelSessions + 1 : prev.totalKegelSessions;

        const existing = prev.recordsByDate[todayKey];
        const updatedRecord = {
          date: todayKey,
          kegelCount: (existing?.kegelCount ?? 0) + (kind === 'kegel' ? 1 : 0),
          relaxCount: (existing?.relaxCount ?? 0) + (kind === 'relax' ? 1 : 0),
          isRestDay: existing?.isRestDay ?? false,
          totalMinutes: (existing?.totalMinutes ?? 0) + minutesSpent,
          flowerId: beforeProgress.stage.id,
        };

        // Check if this session just caused a flower stage to reach full bloom
        let nextSpecimens = prev.unlockedSpecimens;
        let nextPendingBloom = prev.pendingBloomStage;

        if (kind === 'kegel') {
          const newlyBloomed = FLOWER_STAGES.find(
            (s) =>
              prev.totalKegelSessions < s.cumulativeEnd &&
              nextTotal >= s.cumulativeEnd
          );
          if (newlyBloomed) {
            const alreadyUnlocked = nextSpecimens.some(
              (u) => u.flowerId === newlyBloomed.id
            );
            if (!alreadyUnlocked) {
              nextSpecimens = [
                ...nextSpecimens,
                {
                  flowerId: newlyBloomed.id,
                  bloomedAt: todayKey,
                  weeksAccompanied: newlyBloomed.weeksLabel,
                },
              ];
            }
            nextPendingBloom = newlyBloomed.id;
          }
        }

        return {
          ...prev,
          totalKegelSessions: nextTotal,
          recordsByDate: {
            ...prev.recordsByDate,
            [todayKey]: updatedRecord,
          },
          unlockedSpecimens: nextSpecimens,
          pendingBloomStage: nextPendingBloom,
        };
      });
    },
    [activeSession]
  );

  const handleLoadPreview = useCallback(
    (
      scenario:
        | 'fresh'
        | 'partial_yesterday'
        | 'missed_mist'
        | 'busy_3days'
        | 'bloom_daisy'
        | 'full_garden'
    ) => {
      const next = buildPreviewState(scenario);
      setState(next);
      setActiveSession(null);
      if (scenario === 'busy_3days') {
        setShowBusyModal(true);
      } else {
        setShowBusyModal(false);
      }
    },
    []
  );

  const handleAcceptLightMode = () => {
    const todayKey = getTodayKey();
    setState((prev) => ({
      ...prev,
      rhythmMode: 'light',
      lastLowTargetPromptDate: todayKey,
    }));
    setShowBusyModal(false);
  };

  const handleKeepCurrentMode = () => {
    const todayKey = getTodayKey();
    setState((prev) => ({
      ...prev,
      lastLowTargetPromptDate: todayKey,
    }));
    setShowBusyModal(false);
  };

  const handleSubmitReflection = (
    stageId: FlowerId,
    feeling: 'better' | 'slight' | 'none'
  ) => {
    const todayKey = getTodayKey();
    setState((prev) => ({
      ...prev,
      reflections: {
        ...prev.reflections,
        [stageId]: { stageId, feeling, date: todayKey },
      },
    }));
  };

  const handleCloseBloomModal = () => {
    setState((prev) => ({ ...prev, pendingBloomStage: null }));
  };

  const handleOpenTodayShareFromPractice = () => {
    const todayKey = getTodayKey();
    const rec = state.recordsByDate[todayKey];
    const [y, m, d] = todayKey.split('-');
    const stageForCard =
      FLOWER_STAGES.find((s) => s.id === activeSession?.stageId) || progress.stage;
    setActiveSession(null);
    setSharePayload({
      flowerId: stageForCard.id,
      flowerName: stageForCard.name,
      dateLabel: `${y}.${m}.${d}`,
      minutes: rec?.totalMinutes || stageForCard.estimatedMinutes,
      isRestDay: false,
    });
  };

  const sessionStage =
    FLOWER_STAGES.find((s) => s.id === activeSession?.stageId) || progress.stage;
  const sessionCompletedCountInStage = Math.max(
    0,
    Math.min(
      sessionStage.targetSessions,
      state.totalKegelSessions - sessionStage.cumulativeStart
    )
  );
  const ritualSubStage =
    sessionCompletedCountInStage >= sessionStage.targetSessions
      ? 'blooming'
      : progress.stage.id === sessionStage.id
        ? progress.subStage
        : 'blooming';

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center sm:py-5 sm:px-4 bg-[#EDE6DC] relative overflow-hidden">
      {/* Subtle warm botanical desk ambience on larger screens */}
      <div
        aria-hidden="true"
        className="hidden sm:block pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(232,198,150,0.22), transparent 45%), radial-gradient(circle at 82% 78%, rgba(143,169,152,0.2), transparent 45%), radial-gradient(circle at 75% 15%, rgba(217,167,167,0.16), transparent 40%)',
        }}
      />

      {/* Centered 9:16 Mobile-First Picture-Book App Shell */}
      <main className="relative w-full h-[100dvh] sm:h-[min(844px,94dvh)] sm:w-auto sm:aspect-[9/16] sm:max-w-[420px] sm:min-w-[375px] watercolor-paper sm:rounded-[38px] sm:shadow-[0_28px_70px_-24px_rgba(74,67,61,0.28)] sm:border sm:border-[#4A433D]/10 overflow-hidden flex flex-col">
        {/* Scrollable Screen Viewport */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {activeSession ? (
            <PracticePage
              kind={activeSession.kind}
              stage={sessionStage}
              isFirstEver={activeSession.isFirstEver}
              nextSubStageAfterCompletion={ritualSubStage}
              nextSessionsInStage={sessionCompletedCountInStage}
              stageTarget={sessionStage.targetSessions}
              onExit={() => setActiveSession(null)}
              onComplete={handlePracticeComplete}
              onOpenTodayShareCard={handleOpenTodayShareFromPractice}
            />
          ) : activeTab === 'home' ? (
            <HomePage
              state={state}
              onStartPractice={handleStartPractice}
              onMarkRestDay={handleMarkRestDay}
              onOpenRhythmSheet={() => setRhythmSheetOpen(true)}
            />
          ) : (
            <JournalPage
              state={state}
              onOpenShareCard={(payload) => setSharePayload(payload)}
            />
          )}
        </div>

        {/* Bottom Navigation Bar (hidden during immersive Practice view) */}
        {!activeSession && (
          <nav
            aria-label="主导航"
            className="absolute bottom-0 inset-x-0 z-30 h-[68px] bg-[#FAF7F2]/92 backdrop-blur-md border-t border-[#4A433D]/[0.08] px-6 flex items-center justify-around"
          >
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`min-h-[48px] min-w-[68px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'home' ? 'text-[#556E5E]' : 'text-[#9C9288] hover:text-[#6E645B]'
              }`}
            >
              <Sprout className="w-[21px] h-[21px]" strokeWidth={activeTab === 'home' ? 2.2 : 1.7} />
              <span className="text-[11px] font-medium">花园</span>
            </button>

            <button
              type="button"
              onClick={() => handleStartPractice('kegel')}
              aria-label="进入花朵呼吸场"
              className="min-h-[48px] min-w-[68px] flex flex-col items-center justify-center gap-1 text-[#9B6363] hover:text-[#7E4B4B] transition-colors cursor-pointer"
            >
              <Flower2 className="w-[22px] h-[22px]" strokeWidth={1.9} />
              <span className="text-[11px] font-medium">呼吸场</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('journal')}
              className={`min-h-[48px] min-w-[68px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'journal' ? 'text-[#556E5E]' : 'text-[#9C9288] hover:text-[#6E645B]'
              }`}
            >
              <BookOpen className="w-[21px] h-[21px]" strokeWidth={activeTab === 'journal' ? 2.2 : 1.7} />
              <span className="text-[11px] font-medium">图鉴</span>
            </button>
          </nav>
        )}

        {/* Overlays & Gentle Modals (scoped cleanly inside the 9:16 mobile shell) */}
        <RhythmSheet
          open={rhythmSheetOpen}
          currentMode={state.rhythmMode}
          totalKegelSessions={state.totalKegelSessions}
          onSelectMode={handleSelectRhythm}
          onLoadPreview={handleLoadPreview}
          onClose={() => setRhythmSheetOpen(false)}
        />

        <ShareCardModal
          payload={sharePayload}
          onClose={() => setSharePayload(null)}
        />

        <BusyRhythmModal
          open={showBusyModal && !activeSession}
          onAcceptLight={handleAcceptLightMode}
          onKeepCurrent={handleKeepCurrentMode}
        />

        <BloomReflectionModal
          flowerId={!activeSession ? state.pendingBloomStage : null}
          onSubmit={handleSubmitReflection}
          onClose={handleCloseBloomModal}
        />
      </main>
    </div>
  );
}
