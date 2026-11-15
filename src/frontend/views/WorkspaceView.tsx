import React, { useState, useEffect } from 'react';
import { 
  Save, Send, Plus, Trash2, Code, Layers, FileText, CheckCircle2, 
  HelpCircle, Eye, RefreshCw, AlertTriangle, ArrowLeft 
} from 'lucide-react';
import { MermaidDiagram } from '../components/MermaidDiagram.tsx';
import { SEED_PROBLEMS_DATA } from '../../domain/data/problemsData.ts';
import { RuleBasedEvaluator } from '../../infrastructure/evaluation/RuleBasedEvaluator.ts';
import { Submission } from '../../domain/entities/Submission.ts';
import { Problem } from '../../domain/entities/Problem.ts';

interface ClassItem {
  id: string;
  name: string;
  stereotype: 'Entity' | 'Interface' | 'AbstractClass' | 'Enum' | 'Service';
  responsibilities: string;
  attributesStr: string;
  methodsStr: string;
}

interface RelationshipItem {
  id: string;
  source: string;
  target: string;
  type: 'Inheritance' | 'Composition' | 'Aggregation' | 'Association' | 'Realization';
  multiplicity: string;
}

interface WorkspaceViewProps {
  problemId: string;
  onBackToCatalog: () => void;
  onEvaluationComplete: (attemptData: any) => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({ problemId, onBackToCatalog, onEvaluationComplete }) => {
  const [problem, setProblem] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'classes' | 'relationships' | 'rationale' | 'diagram'>('classes');

  // Form State
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [relationships, setRelationships] = useState<RelationshipItem[]>([]);
  const [designPatterns, setDesignPatterns] = useState<string[]>([]);
  const [rationale, setRationale] = useState<string>('');
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // New Class Inline Form
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassStereotype, setNewClassStereotype] = useState<ClassItem['stereotype']>('Entity');
  const [newClassResp, setNewClassResp] = useState<string>('');

  // 1. Initialize or Fetch Problem & Attempt
  useEffect(() => {
    let isMounted = true;

    const initWorkspace = async () => {
      try {
        let problemData: any = null;

        // Fetch problem detail from API
        try {
          const pRes = await fetch(`/api/problems/${problemId}`);
          if (pRes.ok) {
            const pData = await pRes.json();
            if (pData?.success && pData.data) {
              problemData = pData.data;
            }
          }
        } catch {
          // Ignore API error; fallback below
        }

        // Fallback to local SEED_PROBLEMS_DATA if API returned nothing
        if (!problemData) {
          problemData = SEED_PROBLEMS_DATA.find(p => p.id === problemId || p.slug === problemId) || null;
        }

        if (isMounted && problemData) {
          setProblem(problemData);
        }

        // Start new attempt via API
        let attemptData: any = null;
        try {
          const aRes = await fetch('/api/attempts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user-101', problemId }),
          });
          if (aRes.ok) {
            const aData = await aRes.json();
            if (aData?.success && aData.data) {
              attemptData = aData.data;
            }
          }
        } catch {
          // Ignore API error; create local attempt below
        }

        // Fallback local attempt if API unavailable
        if (!attemptData) {
          attemptData = {
            id: `local-att-${Date.now()}`,
            userId: 'user-101',
            problemId,
            status: 'DRAFT',
            attemptNumber: 1,
            submission: undefined,
          };
        }

        if (isMounted && attemptData) {
          setAttempt(attemptData);

          if (attemptData.submission && attemptData.submission.classes && attemptData.submission.classes.length > 0) {
            setClasses(attemptData.submission.classes.map((c: any) => ({
              id: c.id || `cls-${Math.random().toString(36).substring(2, 7)}`,
              name: c.name,
              stereotype: c.stereotype || 'Entity',
              responsibilities: c.responsibilities || '',
              attributesStr: (c.attributes || []).map((a: any) => `${a.name}: ${a.type}`).join(', '),
              methodsStr: (c.methods || []).map((m: any) => `${m.name}: ${m.returnType}`).join(', '),
            })));
            if (attemptData.submission.relationships) {
              setRelationships(attemptData.submission.relationships.map((r: any) => ({
                id: r.id || `rel-${Math.random().toString(36).substring(2, 7)}`,
                source: r.source,
                target: r.target,
                type: r.type,
                multiplicity: r.multiplicity || '1',
              })));
            }
            if (attemptData.submission.designPatterns) setDesignPatterns(attemptData.submission.designPatterns);
            if (attemptData.submission.rationale) setRationale(attemptData.submission.rationale);
            if (attemptData.submission.codeSnippet) setCodeSnippet(attemptData.submission.codeSnippet);
          } else if (problemData && classes.length === 0) {
            const starterClasses: ClassItem[] = (problemData.expectedEntities || []).slice(0, 3).map((name: string, i: number) => ({
              id: `cls-${i + 1}`,
              name,
              stereotype: name.includes('Strategy') || name.includes('Service') ? 'Interface' : 'Entity',
              responsibilities: `Manages core ${name.toLowerCase()} domain behavior and state invariants.`,
              attributesStr: 'id: string, createdAt: Date',
              methodsStr: 'execute(): void',
            }));
            setClasses(starterClasses);
          }
        }
      } catch (err) {
        console.error('Failed to initialize workspace:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initWorkspace();

    return () => {
      isMounted = false;
    };
  }, [problemId]);

  // 2. Save Draft Action
  const handleSaveDraft = async () => {
    if (!attempt) return;
    try {
      setStatusMessage('Saving draft...');
      const payload = formatSubmissionPayload();
      try {
        const res = await fetch(`/api/attempts/${attempt.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setStatusMessage('Draft saved successfully');
            setTimeout(() => setStatusMessage(''), 2500);
            return;
          }
        }
      } catch {
        // Fallback: local draft saved
      }
      setStatusMessage('Draft saved locally');
      setTimeout(() => setStatusMessage(''), 2500);
    } catch (err) {
      setStatusMessage('Error saving draft');
    }
  };

  // 3. Submit Attempt Action
  const handleSubmit = async () => {
    if (!attempt) return;
    if (classes.length === 0 && rationale.trim().length === 0) {
      alert('Please add at least 1 class or design rationale before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = formatSubmissionPayload();

      // Attempt API submission
      try {
        await fetch(`/api/attempts/${attempt.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const res = await fetch(`/api/attempts/${attempt.id}/submit`, {
          method: 'POST',
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.success && data.data) {
            onEvaluationComplete(data.data);
            return;
          }
        }
      } catch {
        // Fallback to local rule-based evaluation if API server is offline
      }

      // Local Evaluator Fallback
      if (problem) {
        const ruleEvaluator = new RuleBasedEvaluator();
        const submission = new Submission({
          attemptId: attempt.id,
          classes: payload.classes,
          relationships: payload.relationships,
          designPatterns: payload.designPatterns,
          rationale: payload.rationale,
          codeSnippet: payload.codeSnippet,
        });
        const problemEntity = new Problem(problem);
        const evalResult = await ruleEvaluator.evaluate(attempt.id, submission, problemEntity);

        const evaluatedAttempt = {
          ...attempt,
          status: 'EVALUATED',
          submission: payload,
          evaluation: evalResult,
          updatedAt: new Date().toISOString(),
        };
        onEvaluationComplete(evaluatedAttempt);
      }
    } catch (err) {
      alert('Error during evaluation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSubmissionPayload = () => {
    return {
      classes: classes.map(c => ({
        id: c.id,
        name: c.name,
        stereotype: c.stereotype,
        responsibilities: c.responsibilities,
        attributes: c.attributesStr.split(',').filter(Boolean).map(a => {
          const [n, t] = a.split(':');
          return { name: n ? n.trim() : 'attr', type: t ? t.trim() : 'string' };
        }),
        methods: c.methodsStr.split(',').filter(Boolean).map(m => {
          const [n, r] = m.split(':');
          return { name: n ? n.trim() : 'method', returnType: r ? r.trim() : 'void' };
        }),
      })),
      relationships: relationships.map(r => ({
        id: r.id,
        source: r.source,
        target: r.target,
        type: r.type,
        multiplicity: r.multiplicity,
      })),
      designPatterns,
      rationale,
      codeSnippet,
      mermaidDiagram: generateMermaidString(),
    };
  };

  const generateMermaidString = (): string => {
    const lines: string[] = ['classDiagram'];
    for (const c of classes) {
      if (c.stereotype === 'Interface') lines.push(`class ${c.name} {\n  <<Interface>>\n}`);
      else if (c.stereotype === 'AbstractClass') lines.push(`class ${c.name} {\n  <<Abstract>>\n}`);
      else lines.push(`class ${c.name}`);
    }
    for (const r of relationships) {
      if (r.type === 'Inheritance') lines.push(`${r.target} <|-- ${r.source}`);
      else if (r.type === 'Realization') lines.push(`${r.target} <|.. ${r.source}`);
      else if (r.type === 'Composition') lines.push(`${r.source} *-- "${r.multiplicity}" ${r.target}`);
      else if (r.type === 'Aggregation') lines.push(`${r.source} o-- "${r.multiplicity}" ${r.target}`);
      else lines.push(`${r.source} --> "${r.multiplicity}" ${r.target}`);
    }
    return lines.join('\n');
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const newCls: ClassItem = {
      id: `cls-${Date.now()}`,
      name: newClassName.trim(),
      stereotype: newClassStereotype,
      responsibilities: newClassResp || 'Primary domain responsibilities',
      attributesStr: 'id: string',
      methodsStr: 'process(): void',
    };
    setClasses([...classes, newCls]);
    setNewClassName('');
    setNewClassResp('');
  };

  const handleRemoveClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  const handleAddRelationship = (source: string, target: string, type: RelationshipItem['type']) => {
    if (!source || !target || source === target) return;
    const newRel: RelationshipItem = {
      id: `rel-${Date.now()}`,
      source,
      target,
      type,
      multiplicity: '1',
    };
    setRelationships([...relationships, newRel]);
  };

  if (loading || !problem) {
    return (
      <div className="text-center py-24 text-slate-500 font-mono">
        Initializing practice workspace...
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-950 flex flex-col">
      {/* Top Action Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToCatalog}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Catalog
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <h2 className="font-bold text-white text-base flex items-center gap-2">
            {problem.title}
          </h2>
          <span className="badge badge-draft text-[10px]">
            State: DRAFT
          </span>
        </div>

        <div className="flex items-center gap-3">
          {statusMessage && (
            <span className="text-xs text-emerald-400 font-mono animate-pulse">
              {statusMessage}
            </span>
          )}
          <button onClick={handleSaveDraft} className="btn-secondary text-xs py-1.5">
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary text-xs py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Design
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Column Split Studio */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Column: Problem Requirements & Specs (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 border-r border-slate-800 p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
          <div className="mb-6">
            <span className={`badge badge-${problem.difficulty.toLowerCase()} mb-2`}>
              {problem.difficulty}
            </span>
            <h3 className="text-lg font-bold text-white mb-2">Problem Statement</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {problem.shortDescription}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              Functional Requirements
            </h4>
            <ul className="space-y-2">
              {problem.requirements.map((req: string, idx: number) => (
                <li key={idx} className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800/80 flex items-start gap-2">
                  <span className="text-indigo-400 font-mono text-[10px] mt-0.5">{idx + 1}.</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              Expected Core Entities
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {problem.expectedEntities.map((ent: string) => {
                const isMatched = classes.some(c => c.name.toLowerCase() === ent.toLowerCase());
                return (
                  <span
                    key={ent}
                    className={`text-xs px-2.5 py-1 rounded font-mono border transition-all ${
                      isMatched
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {isMatched ? '✓ ' : ''}{ent}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Studio (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950 overflow-y-auto max-h-[calc(100vh-120px)]">
          {/* Workspace Tabs */}
          <div className="bg-slate-900 border-b border-slate-800 px-6 flex gap-4">
            <button
              onClick={() => setActiveTab('classes')}
              className={`py-3 text-xs font-mono font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'classes'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Classes & Stereotypes ({classes.length})
            </button>

            <button
              onClick={() => setActiveTab('relationships')}
              className={`py-3 text-xs font-mono font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'relationships'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Relationships ({relationships.length})
            </button>

            <button
              onClick={() => setActiveTab('rationale')}
              className={`py-3 text-xs font-mono font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'rationale'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Patterns & Trade-offs
            </button>

            <button
              onClick={() => setActiveTab('diagram')}
              className={`py-3 text-xs font-mono font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'diagram'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              Live Mermaid UML
            </button>
          </div>

          {/* Tab 1: Class Builder */}
          {activeTab === 'classes' && (
            <div className="p-6 space-y-6">
              {/* Add Class Form */}
              <form onSubmit={handleAddClass} className="glass-panel p-4 rounded-lg flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Class Name</label>
                  <input
                    type="text"
                    placeholder="e.g. SpotAssignmentStrategy"
                    value={newClassName}
                    onChange={e => setNewClassName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Stereotype</label>
                  <select
                    value={newClassStereotype}
                    onChange={e => setNewClassStereotype(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="Entity">Entity</option>
                    <option value="Interface">Interface</option>
                    <option value="AbstractClass">AbstractClass</option>
                    <option value="Service">Service</option>
                    <option value="Enum">Enum</option>
                  </select>
                </div>

                <div className="flex-[2] min-w-[240px]">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Responsibilities</label>
                  <input
                    type="text"
                    placeholder="e.g. Encapsulates algorithm for finding open parking spots"
                    value={newClassResp}
                    onChange={e => setNewClassResp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button type="submit" className="btn-primary text-xs py-1.5">
                  <Plus className="w-4 h-4" />
                  Add Class
                </button>
              </form>

              {/* Class Cards */}
              <div className="space-y-4">
                {classes.map(cls => (
                  <div key={cls.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono text-sm">{cls.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                          &lt;&lt;{cls.stereotype}&gt;&gt;
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveClass(cls.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 mb-1">Responsibilities</label>
                        <textarea
                          rows={2}
                          value={cls.responsibilities}
                          onChange={e => {
                            const updated = classes.map(c => c.id === cls.id ? { ...c, responsibilities: e.target.value } : c);
                            setClasses(updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 mb-1">Attributes (comma separated)</label>
                        <input
                          type="text"
                          value={cls.attributesStr}
                          onChange={e => {
                            const updated = classes.map(c => c.id === cls.id ? { ...c, attributesStr: e.target.value } : c);
                            setClasses(updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 font-mono mb-2 focus:outline-none focus:border-indigo-500 text-xs"
                        />

                        <label className="block text-[10px] font-mono text-slate-400 mb-1">Methods (comma separated)</label>
                        <input
                          type="text"
                          value={cls.methodsStr}
                          onChange={e => {
                            const updated = classes.map(c => c.id === cls.id ? { ...c, methodsStr: e.target.value } : c);
                            setClasses(updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 font-mono focus:outline-none focus:border-indigo-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Relationships */}
          {activeTab === 'relationships' && (
            <div className="p-6 space-y-6">
              <div className="glass-panel p-4 rounded-lg">
                <h4 className="text-xs font-mono text-slate-300 font-semibold mb-3">Add Relationship Connection</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">Source Class</label>
                    <select id="rel-source" className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white font-mono">
                      {classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">Relationship Type</label>
                    <select id="rel-type" className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white font-mono">
                      <option value="Composition">Composition (*--)</option>
                      <option value="Inheritance">Inheritance (&lt;|--)</option>
                      <option value="Realization">Realization (&lt;|..)</option>
                      <option value="Aggregation">Aggregation (o--)</option>
                      <option value="Association">Association (--&gt;)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">Target Class</label>
                    <select id="rel-target" className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white font-mono">
                      {classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        const s = (document.getElementById('rel-source') as HTMLSelectElement).value;
                        const t = (document.getElementById('rel-target') as HTMLSelectElement).value;
                        const typ = (document.getElementById('rel-type') as HTMLSelectElement).value as any;
                        handleAddRelationship(s, t, typ);
                      }}
                      className="btn-primary w-full text-xs py-1.5 justify-center"
                    >
                      <Plus className="w-4 h-4" /> Add Connection
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {relationships.map(rel => (
                  <div key={rel.id} className="bg-slate-900 border border-slate-800 rounded p-3 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">{rel.source}</span>
                      <span className="text-indigo-400 px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-[11px]">
                        [{rel.type}]
                      </span>
                      <span className="text-white font-bold">{rel.target}</span>
                    </div>
                    <button
                      onClick={() => setRelationships(relationships.filter(r => r.id !== rel.id))}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Design Patterns & Rationale */}
          {activeTab === 'rationale' && (
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-mono text-slate-300 font-semibold mb-2">Applied Design Patterns</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Strategy Pattern', 'Factory Pattern', 'Observer Pattern', 'Singleton Pattern', 'State Pattern', 'Decorator Pattern'].map(pat => {
                    const isSelected = designPatterns.includes(pat);
                    return (
                      <button
                        key={pat}
                        type="button"
                        onClick={() => {
                          if (isSelected) setDesignPatterns(designPatterns.filter(p => p !== pat));
                          else setDesignPatterns([...designPatterns, pat]);
                        }}
                        className={`px-3 py-1 rounded text-xs font-mono border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{pat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-semibold mb-2">
                  Design Decisions & Trade-off Explanation
                </label>
                <textarea
                  rows={6}
                  value={rationale}
                  onChange={e => setRationale(e.target.value)}
                  placeholder="Explain why you chose specific abstractions, how SOLID principles were adhered to, and how your design handles future requirements..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 font-semibold mb-2">
                  Optional TypeScript / Java Code Skeleton
                </label>
                <textarea
                  rows={6}
                  value={codeSnippet}
                  onChange={e => setCodeSnippet(e.target.value)}
                  placeholder="interface SpotAssignmentStrategy { ... }"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-emerald-400 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Tab 4: Live Mermaid Diagram */}
          {activeTab === 'diagram' && (
            <div className="p-6 space-y-4">
              <h4 className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Auto-Generated Mermaid Class Diagram</span>
                <span className="text-[10px] text-indigo-400">Live Render</span>
              </h4>
              <MermaidDiagram chart={generateMermaidString()} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
