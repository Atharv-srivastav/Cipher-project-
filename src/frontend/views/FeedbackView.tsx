import React from 'react';
import { 
  Award, CheckCircle2, AlertTriangle, ShieldCheck, Zap, 
  ArrowRight, RefreshCw, Layers, History, ArrowLeft, Cpu 
} from 'lucide-react';

interface FeedbackViewProps {
  attemptData: any;
  onTryAgain: () => void;
  onViewHistory: () => void;
  onBackToCatalog: () => void;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({ attemptData, onTryAgain, onViewHistory, onBackToCatalog }) => {
  const evaluation = attemptData?.evaluation;
  if (!evaluation) {
    return (
      <div className="text-center py-20 text-slate-500 font-mono">
        No evaluation data found for this attempt.
      </div>
    );
  }

  const score = evaluation.overallScore || 0;
  const isFallback = evaluation.evaluatorMode === 'RULE_BASED_FALLBACK';
  const criteria = evaluation.criteria || {
    responsibilities: 7,
    abstraction: 7,
    coupling: 7,
    solid: 7,
    designPatterns: 7,
    extensibility: 7,
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
    if (s >= 65) return 'text-amber-400 border-amber-500/40 bg-amber-950/20';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/20';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <button
            onClick={onBackToCatalog}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
          </button>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            Evaluation & Design Scorecard
            <span className="badge badge-evaluated text-xs">EVALUATED</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Attempt #{attemptData.attemptNumber || 1} • {new Date(evaluation.evaluatedAt || Date.now()).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onViewHistory} className="btn-secondary text-xs py-2">
            <History className="w-4 h-4" /> History
          </button>
          <button onClick={onTryAgain} className="btn-primary text-xs py-2 bg-indigo-600 hover:bg-indigo-500">
            <RefreshCw className="w-4 h-4" /> Try Again (New Attempt)
          </button>
        </div>
      </div>

      {/* Fallback Banner Notice if LLM API was offline */}
      {isFallback && (
        <div className="bg-amber-950/30 border border-amber-800/60 rounded-lg p-4 flex items-start gap-3 text-amber-300 text-xs leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Deterministic Rule-Based Evaluator Active</span>
            AI LLM API fallback was triggered because no GEMINI_API_KEY was configured or a temporary API timeout occurred. Structural evaluation, missing entity checks, and design rules were fully evaluated.
          </div>
        </div>
      )}

      {/* Main Scorecard Banner */}
      <div className="glass-panel rounded-2xl p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Overall Radial Score (4 Cols) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-8">
          <div className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-xl ${getScoreColor(score)}`}>
            <span className="text-4xl font-extrabold font-mono tracking-tight">{score}</span>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mt-1">/ 100</span>
          </div>
          <div className="mt-4 text-center">
            <span className="text-xs font-mono uppercase text-slate-400 block mb-1">Evaluator Engine:</span>
            <span className="text-xs font-semibold px-3 py-1 rounded bg-slate-900 text-indigo-400 border border-slate-800 inline-flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              {evaluation.evaluatorMode}
            </span>
          </div>
        </div>

        {/* Summary & Category Breakdown (8 Cols) */}
        <div className="md:col-span-8 space-y-6">
          <div>
            <h2 className="text-sm font-mono uppercase text-slate-400 font-semibold mb-2">Executive Summary</h2>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono">
              "{evaluation.summary}"
            </p>
          </div>

          <div>
            <h2 className="text-sm font-mono uppercase text-slate-400 font-semibold mb-3">6-Dimension Criteria Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Responsibilities', val: criteria.responsibilities },
                { label: 'Abstraction Quality', val: criteria.abstraction },
                { label: 'Coupling & Cohesion', val: criteria.coupling },
                { label: 'SOLID Principles', val: criteria.solid },
                { label: 'Design Patterns', val: criteria.designPatterns },
                { label: 'Extensibility', val: criteria.extensibility },
              ].map(item => (
                <div key={item.label} className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-400 text-[11px] font-mono">{item.label}</span>
                    <span className="font-bold text-white font-mono">{item.val}/10</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all ${
                        item.val >= 8 ? 'bg-emerald-500' : item.val >= 6 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${(item.val / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Explainable Findings & Evidence Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Strengths */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Key Design Strengths ({evaluation.feedbackItems?.filter((f: any) => f.category === 'STRENGTH').length || 0})
          </h3>
          <div className="space-y-3">
            {evaluation.feedbackItems?.filter((f: any) => f.category === 'STRENGTH').map((item: any, idx: number) => (
              <div key={idx} className="bg-slate-950 border border-emerald-950/60 p-3.5 rounded-lg text-xs">
                <span className="font-bold text-emerald-300 block mb-1">{item.title}</span>
                <p className="text-slate-300 leading-relaxed mb-2">{item.description}</p>
                {item.evidence && (
                  <span className="block text-[10px] font-mono text-slate-400 bg-slate-900 p-1.5 rounded border border-slate-800">
                    Evidence: "{item.evidence}"
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Weaknesses & Improvements */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Weaknesses & Anti-Pattern Observations
          </h3>
          <div className="space-y-3">
            {evaluation.feedbackItems?.filter((f: any) => f.category === 'WEAKNESS' || f.category === 'SOLID_OBSERVATION').map((item: any, idx: number) => (
              <div key={idx} className="bg-slate-950 border border-rose-950/60 p-3.5 rounded-lg text-xs">
                <span className="font-bold text-rose-300 block mb-1">{item.title}</span>
                <p className="text-slate-300 leading-relaxed mb-2">{item.description}</p>
                {item.evidence && (
                  <span className="block text-[10px] font-mono text-slate-400 bg-slate-900 p-1.5 rounded border border-slate-800">
                    Evidence: "{item.evidence}"
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
