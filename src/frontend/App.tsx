import React, { useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { ProblemCatalogView } from './views/ProblemCatalogView.tsx';
import { WorkspaceView } from './views/WorkspaceView.tsx';
import { FeedbackView } from './views/FeedbackView.tsx';
import { HistoryView } from './views/HistoryView.tsx';
import { SEED_PROBLEMS_DATA } from '../domain/data/problemsData.ts';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'catalog' | 'workspace' | 'feedback' | 'history'>('catalog');
  const [activeProblemId, setActiveProblemId] = useState<string>('prob-parking-lot');
  const [activeAttemptData, setActiveAttemptData] = useState<any>(null);

  const activeProblem = SEED_PROBLEMS_DATA.find(p => p.id === activeProblemId || p.slug === activeProblemId);
  const activeProblemTitle = activeProblem?.title || activeProblemId;

  const handleSelectProblem = (problemId: string) => {
    setActiveProblemId(problemId);
    setCurrentTab('workspace');
  };

  const handleEvaluationComplete = (attemptData: any) => {
    setActiveAttemptData(attemptData);
    setCurrentTab('feedback');
  };

  const handleReopenAttempt = async (attemptId: string) => {
    try {
      const res = await fetch(`/api/attempts/${attemptId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setActiveAttemptData(data.data);
        setActiveProblemId(data.data.problemId);
        if (data.data.status === 'EVALUATED') {
          setCurrentTab('feedback');
        } else {
          setCurrentTab('workspace');
        }
      }
    } catch (err) {
      console.error('Error reopening attempt:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab === 'feedback' ? 'workspace' : currentTab}
        onNavigate={tab => setCurrentTab(tab)}
        activeProblemTitle={activeProblemTitle}
      />

      <main className="flex-1">
        {currentTab === 'catalog' && (
          <ProblemCatalogView onSelectProblem={handleSelectProblem} />
        )}

        {currentTab === 'workspace' && (
          <WorkspaceView
            problemId={activeProblemId}
            onBackToCatalog={() => setCurrentTab('catalog')}
            onEvaluationComplete={handleEvaluationComplete}
          />
        )}

        {currentTab === 'feedback' && (
          <FeedbackView
            attemptData={activeAttemptData}
            onTryAgain={() => setCurrentTab('workspace')}
            onViewHistory={() => setCurrentTab('history')}
            onBackToCatalog={() => setCurrentTab('catalog')}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            onReopenAttempt={handleReopenAttempt}
            onSelectProblem={handleSelectProblem}
          />
        )}
      </main>
    </div>
  );
};

export default App;
