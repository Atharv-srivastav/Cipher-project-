import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Cpu,
  RefreshCw,
  Search,
  Target,
  X,
  SlidersHorizontal,
  Trophy,
  Eye,
  Sparkles,
  Wifi,
  WifiOff,
  BookOpen
} from 'lucide-react';
import { SEED_PROBLEMS_DATA } from '../../domain/data/problemsData.ts';

export interface ProblemSummary {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  shortDescription: string;
  requirements: string[];
  expectedEntities: string[];
  tags: string[];
  estimatedMinutes: number;
}

interface HistoryScore {
  problemId: string;
  score?: number;
  status: string;
}

interface ProblemCatalogViewProps {
  onSelectProblem: (problemId: string) => void;
}

type SortOption = 'default' | 'difficulty-asc' | 'difficulty-desc' | 'time-asc' | 'title-asc';

const formatProblemSummary = (p: typeof SEED_PROBLEMS_DATA[number]): ProblemSummary => ({
  id: p.id,
  title: p.title,
  slug: p.slug,
  difficulty: p.difficulty,
  shortDescription: p.shortDescription,
  requirements: p.requirements || [],
  expectedEntities: p.expectedEntities || [],
  tags: p.tags || [],
  estimatedMinutes: p.estimatedMinutes || 30,
});

const DEFAULT_PROBLEM_SUMMARIES: ProblemSummary[] = SEED_PROBLEMS_DATA.map(formatProblemSummary);

export const ProblemCatalogView: React.FC<ProblemCatalogViewProps> = ({ onSelectProblem }) => {
  const [problems, setProblems] = useState<ProblemSummary[]>(DEFAULT_PROBLEM_SUMMARIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [historyScores, setHistoryScores] = useState<Record<string, { score: number; status: string }>>({});
  const [selectedPreviewProblem, setSelectedPreviewProblem] = useState<ProblemSummary | null>(null);
  const [retryKey, setRetryKey] = useState<number>(0);

  // Load problem catalog and history
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4000);

    const fetchCatalogData = async () => {
      setLoading(true);

      try {
        const res = await fetch('/api/problems', { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }
        const data = await res.json().catch(() => null);

        if (isMounted) {
          if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
            setProblems(data.data);
            setIsOffline(false);
          } else {
            // Fall back to seed data
            setProblems(DEFAULT_PROBLEM_SUMMARIES);
            setIsOffline(false);
          }
        }
      } catch (err: any) {
        if (!isMounted) return;

        // If fetch failed due to offline backend or timeout, gracefully fallback to seed problems
        console.warn('[ProblemCatalog] API server unavailable, falling back to local problem catalog:', err?.message || err);
        setProblems(DEFAULT_PROBLEM_SUMMARIES);
        setIsOffline(true);
      } finally {
        if (isMounted) {
          window.clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    fetchCatalogData();

    // Fetch user attempt history non-blockingly
    fetch('/api/history?userId=user-101', { signal: controller.signal })
      .then(async res => {
        if (!res.ok) return null;
        return res.json().catch(() => null);
      })
      .then(data => {
        if (isMounted && data?.success && Array.isArray(data.data)) {
          const scoresMap: Record<string, { score: number; status: string }> = {};
          for (const item of data.data as HistoryScore[]) {
            if (item.problemId && item.score !== undefined) {
              if (!scoresMap[item.problemId] || (scoresMap[item.problemId].score < item.score)) {
                scoresMap[item.problemId] = { score: item.score, status: item.status };
              }
            }
          }
          setHistoryScores(scoresMap);
        }
      })
      .catch(() => {
        // Silently ignore history fetch errors in offline preview
      });

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [retryKey]);

  // Extract all unique tags across problems
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    for (const p of problems) {
      if (Array.isArray(p.tags)) {
        for (const t of p.tags) {
          tagsSet.add(t);
        }
      }
    }
    return Array.from(tagsSet).sort();
  }, [problems]);

  // Filter & Sort logic
  const filteredProblems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = problems.filter(problem => {
      const matchesDifficulty = filterDifficulty === 'ALL' || problem.difficulty === filterDifficulty;
      const matchesTag = filterTag === 'ALL' || (Array.isArray(problem.tags) && problem.tags.includes(filterTag));
      const searchableText = [
        problem.title,
        problem.shortDescription,
        ...(problem.tags || []),
        ...(problem.expectedEntities || []),
        ...(problem.requirements || []),
      ].join(' ').toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      return matchesDifficulty && matchesTag && matchesSearch;
    });

    // Sorting
    const difficultyWeight = { EASY: 1, MEDIUM: 2, HARD: 3 };
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'difficulty-asc':
          return difficultyWeight[a.difficulty] - difficultyWeight[b.difficulty];
        case 'difficulty-desc':
          return difficultyWeight[b.difficulty] - difficultyWeight[a.difficulty];
        case 'time-asc':
          return a.estimatedMinutes - b.estimatedMinutes;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'default':
        default:
          return 0;
      }
    });
  }, [problems, filterDifficulty, filterTag, searchQuery, sortBy]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = problems.length;
    const easy = problems.filter(p => p.difficulty === 'EASY').length;
    const medium = problems.filter(p => p.difficulty === 'MEDIUM').length;
    const hard = problems.filter(p => p.difficulty === 'HARD').length;
    const attemptedCount = Object.keys(historyScores).length;
    return { total, easy, medium, hard, attemptedCount };
  }, [problems, historyScores]);

  const difficultyCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: problems.length, EASY: 0, MEDIUM: 0, HARD: 0 };
    for (const p of problems) {
      counts[p.difficulty] = (counts[p.difficulty] || 0) + 1;
    }
    return counts;
  }, [problems]);

  const handleResetFilters = () => {
    setFilterDifficulty('ALL');
    setFilterTag('ALL');
    setSearchQuery('');
    setSortBy('default');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Hero Header Section */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/80 text-xs font-medium text-indigo-300 mb-4 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Interactive Object-Oriented Design Platform</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
          Master Low-Level System Design
        </h1>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
          Practice iconic object-oriented design problems interactively. Model domain classes, define responsibilities,
          wire relationships, and receive instant hybrid AI & explainable architectural evaluation.
        </p>

        {/* Quick Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg text-left">
          <div className="p-2 sm:p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="text-[11px] font-mono uppercase text-slate-500 block">Total Problems</span>
            <span className="text-xl font-bold text-white flex items-center gap-1.5 mt-0.5">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              {stats.total}
            </span>
          </div>

          <div className="p-2 sm:p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="text-[11px] font-mono uppercase text-slate-500 block">Difficulty Mix</span>
            <span className="text-xs font-semibold flex items-center gap-1.5 mt-1">
              <span className="text-emerald-400">{stats.easy}E</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400">{stats.medium}M</span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400">{stats.hard}H</span>
            </span>
          </div>

          <div className="p-2 sm:p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="text-[11px] font-mono uppercase text-slate-500 block">Your Completed</span>
            <span className="text-xl font-bold text-white flex items-center gap-1.5 mt-0.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              {stats.attemptedCount} / {stats.total}
            </span>
          </div>

          <div className="p-2 sm:p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="text-[11px] font-mono uppercase text-slate-500 block">Evaluation Mode</span>
            <span className="text-xs font-mono font-medium text-indigo-300 flex items-center gap-1.5 mt-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Hybrid + Rules
            </span>
          </div>
        </div>

        {/* Offline / Server Status Banner */}
        {isOffline && (
          <div className="mt-4 flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 text-left">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Offline Preview Mode:</strong> Serving built-in problem catalog. API backend is offline (port 3002).
              </span>
            </div>
            <button
              onClick={() => setRetryKey(k => k + 1)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-100 font-medium transition-colors text-[11px] flex-shrink-0"
              title="Retry connection to API server"
            >
              <RefreshCw className="w-3 h-3" />
              Reconnect
            </button>
          </div>
        )}
      </div>

      {/* Control Bar: Search, Filters & Sorting */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Difficulty Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(diff => (
              <button
                key={diff}
                type="button"
                aria-pressed={filterDifficulty === diff}
                onClick={() => setFilterDifficulty(diff)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  filterDifficulty === diff
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{diff}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterDifficulty === diff ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {difficultyCounts[diff] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar & Tag / Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search title, entities, patterns..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-8 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Pattern Tag Dropdown */}
            <div className="relative">
              <select
                value={filterTag}
                onChange={e => setFilterTag(e.target.value)}
                className="w-full sm:w-auto appearance-none rounded-lg border border-slate-800 bg-slate-900 py-2 pl-3 pr-8 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Design Patterns</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <SlidersHorizontal className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-auto appearance-none rounded-lg border border-slate-800 bg-slate-900 py-2 pl-3 pr-8 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="default">Sort: Default</option>
                <option value="difficulty-asc">Difficulty: Easy to Hard</option>
                <option value="difficulty-desc">Difficulty: Hard to Easy</option>
                <option value="time-asc">Time: Shortest First</option>
                <option value="title-asc">Title: A-Z</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 h-0 w-0" />
            </div>
          </div>
        </div>

        {/* Active Filters Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Showing <strong className="text-white font-mono">{filteredProblems.length}</strong> of {problems.length} problems</span>
            {(filterDifficulty !== 'ALL' || filterTag !== 'ALL' || searchQuery.trim()) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 ml-2"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
            {isOffline ? (
              <span className="flex items-center gap-1 text-amber-400/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
                Local Mode
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Live Sync
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Problem Cards Grid */}
      {loading ? (
        <div className="studio-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-panel rounded-xl p-6 animate-pulse flex flex-col justify-between h-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-16 bg-slate-800 rounded-full" />
                  <div className="h-4 w-20 bg-slate-800 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-slate-800 rounded" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-800/60 rounded" />
                  <div className="h-3 w-5/6 bg-slate-800/60 rounded" />
                </div>
              </div>
              <div className="h-10 bg-slate-800 rounded-lg w-full" />
            </div>
          ))}
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <div className="h-12 w-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No matching problems</h3>
          <p className="text-xs text-slate-400 mb-6">
            We couldn't find any problem matching your search or filter combination.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn-secondary text-xs mx-auto"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="studio-grid">
          {filteredProblems.map(prob => {
            const history = historyScores[prob.id];

            return (
              <div
                key={prob.id}
                className="glass-panel rounded-xl p-6 flex flex-col justify-between hover:border-slate-600 transition-all duration-200 group border border-slate-800/80 shadow-md hover:shadow-indigo-950/20"
              >
                <div>
                  {/* Top Header Badge Row */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className={`badge badge-${prob.difficulty.toLowerCase()}`}>
                      {prob.difficulty}
                    </span>

                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      OOAD Standard
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {prob.title}
                  </h2>

                  {/* Description */}
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                    {prob.shortDescription}
                  </p>

                  {/* Requirements Snippet */}
                  <div className="mb-4 space-y-1.5 p-3 rounded-lg bg-slate-950/60 border border-slate-900">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                      Core Scenarios:
                    </span>
                    {(prob.requirements || []).slice(0, 2).map((req, idx) => (
                      <p key={idx} className="flex items-start gap-2 text-xs leading-snug text-slate-300">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span className="line-clamp-1">{req}</span>
                      </p>
                    ))}
                  </div>

                  {/* Design Pattern & Domain Tags */}
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {(prob.tags || []).map(tag => (
                      <span
                        key={tag}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterTag(tag);
                        }}
                        className="rounded-md border border-indigo-900/60 bg-indigo-950/40 px-2 py-0.5 text-[11px] font-medium text-indigo-300 hover:bg-indigo-900/60 cursor-pointer transition-colors"
                        title={`Filter by ${tag}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Expected Entities Preview */}
                  <div className="mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5 font-semibold">
                      Target Entities ({prob.expectedEntities?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(prob.expectedEntities || []).slice(0, 4).map(entity => (
                        <span
                          key={entity}
                          className="text-xs px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-800 font-mono"
                        >
                          {entity}
                        </span>
                      ))}
                      {(prob.expectedEntities?.length || 0) > 4 && (
                        <span className="text-xs px-1.5 py-0.5 text-slate-500 font-mono">
                          +{prob.expectedEntities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="mb-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5" title="Estimated time">
                      <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                      {prob.estimatedMinutes} mins
                    </span>

                    <span className="flex items-center gap-1.5" title="Expected classes/entities">
                      <Target className="h-3.5 w-3.5 text-slate-400" />
                      {prob.expectedEntities?.length || 0} classes
                    </span>

                    {history ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold" title="Best score recorded">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Best: {history.score}/100
                      </span>
                    ) : (
                      <span className="text-slate-600 font-sans text-[11px]">
                        Not attempted
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPreviewProblem(prob)}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                    title="Quick preview requirements"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Specs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectProblem(prob.id)}
                    className="btn-primary flex-1 justify-center py-2 text-xs group-hover:bg-indigo-500"
                  >
                    <span>Start Practice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Problem Quick View Modal */}
      {selectedPreviewProblem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setSelectedPreviewProblem(null)}
        >
          <div
            className="glass-panel border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedPreviewProblem(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`badge badge-${selectedPreviewProblem.difficulty.toLowerCase()}`}>
                {selectedPreviewProblem.difficulty}
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock3 className="w-3.5 h-3.5" />
                {selectedPreviewProblem.estimatedMinutes} mins practice
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              {selectedPreviewProblem.title}
            </h2>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {selectedPreviewProblem.shortDescription}
            </p>

            {/* Requirements Section */}
            <div className="mb-6">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                Functional Requirements:
              </h3>
              <div className="space-y-2 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                {(selectedPreviewProblem.requirements || []).map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="text-indigo-400 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Entities Section */}
            <div className="mb-6">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
                Expected Classes & Interfaces:
              </h3>
              <div className="flex flex-wrap gap-2">
                {(selectedPreviewProblem.expectedEntities || []).map(entity => (
                  <span
                    key={entity}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-indigo-300 font-mono font-medium"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags Section */}
            <div className="mb-8">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Recommended Design Patterns:
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(selectedPreviewProblem.tags || []).map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedPreviewProblem(null)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = selectedPreviewProblem.id;
                  setSelectedPreviewProblem(null);
                  onSelectProblem(id);
                }}
                className="btn-primary text-xs"
              >
                <span>Open Practice Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
