import React from 'react';
import { Layers, BookOpen, History, Cpu } from 'lucide-react';

interface NavbarProps {
  currentTab: 'catalog' | 'workspace' | 'history';
  onNavigate: (tab: 'catalog' | 'workspace' | 'history') => void;
  activeProblemTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, activeProblemTitle }) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('catalog')}>
        <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white leading-none tracking-tight flex items-center gap-2">
            LLD Studio
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
              MVP
            </span>
          </h1>
          <p className="text-xs text-slate-400">Object-Oriented Design Practice Platform</p>
        </div>
      </div>

      {activeProblemTitle && currentTab === 'workspace' && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-sm text-slate-300">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span className="font-mono text-xs text-slate-400">Active Practice:</span>
          <span className="font-medium text-white">{activeProblemTitle}</span>
        </div>
      )}

      <nav className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('catalog')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
            currentTab === 'catalog'
              ? 'bg-slate-800 text-indigo-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Problems
        </button>
        <button
          onClick={() => onNavigate('history')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
            currentTab === 'history'
              ? 'bg-slate-800 text-indigo-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          History
        </button>
      </nav>
    </header>
  );
};
