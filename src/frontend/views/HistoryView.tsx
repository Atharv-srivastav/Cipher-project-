import React, { useEffect, useState } from 'react';
import { History, Calendar, Award, RefreshCw, ArrowRight, BookOpen, Cpu } from 'lucide-react';

interface HistoryItem {
  attemptId: string;
  problemId: string;
  problemTitle: string;
  attemptNumber: number;
  status: string;
  score?: number;
  evaluatorMode?: string;
  summary?: string;
  updatedAt: string;
}

interface HistoryViewProps {
  onReopenAttempt: (attemptId: string) => void;
  onSelectProblem: (problemId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onReopenAttempt, onSelectProblem }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/history?userId=user-101')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHistory(data.data);
        }
      })
      .catch(err => console.error('Failed loading history:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" />
            Attempt History & Progress Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review past LLD practice attempts, score trends, and reopen designs to try again.
          </p>
        </div>

        <button onClick={() => onSelectProblem('prob-parking-lot')} className="btn-primary text-xs py-2">
          <BookOpen className="w-4 h-4" /> Start New Problem
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-mono text-sm">
          Loading attempt history...
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Practice Attempts Yet</h3>
          <p className="text-xs text-slate-400 mb-6">Choose an LLD problem from the catalog to start practicing!</p>
          <button onClick={() => onSelectProblem('prob-parking-lot')} className="btn-primary text-xs mx-auto">
            Browse Problem Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(item => (
            <div
              key={item.attemptId}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-indigo-400 shrink-0">
                  #{item.attemptNumber}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-base">{item.problemTitle}</h3>
                    <span className={`badge badge-${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1 mb-2 font-mono">
                    {item.summary || 'Draft submission in progress.'}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.updatedAt).toLocaleString()}
                    </span>
                    {item.evaluatorMode && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                        {item.evaluatorMode}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                {item.score !== undefined && (
                  <div className="text-right">
                    <span className="text-xs font-mono uppercase text-slate-500 block">Score</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {item.score}<span className="text-xs text-slate-500">/100</span>
                    </span>
                  </div>
                )}

                <button
                  onClick={() => onReopenAttempt(item.attemptId)}
                  className="btn-secondary text-xs py-2"
                >
                  <span>Reopen Design</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
