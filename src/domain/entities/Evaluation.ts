import { CriteriaBreakdown, FeedbackItem, FeedbackItemData } from '../value-objects/FeedbackCriterion.ts';

export type EvaluatorMode = 'HYBRID_AI' | 'RULE_BASED_FALLBACK' | 'RULE_BASED_ONLY';

export interface EvaluationData {
  id?: string;
  attemptId: string;
  overallScore: number;
  evaluatorMode: EvaluatorMode;
  summary: string;
  criteria: CriteriaBreakdown;
  feedbackItems: FeedbackItemData[];
  evaluatedAt?: string;
}

export class Evaluation {
  public readonly id: string;
  public readonly attemptId: string;
  public readonly overallScore: number;
  public readonly evaluatorMode: EvaluatorMode;
  public readonly summary: string;
  public readonly criteria: CriteriaBreakdown;
  public readonly feedbackItems: FeedbackItem[];
  public readonly evaluatedAt: string;

  constructor(data: EvaluationData) {
    this.id = data.id || `eval-${Math.random().toString(36).substring(2, 9)}`;
    this.attemptId = data.attemptId;
    this.overallScore = Math.max(0, Math.min(100, Math.round(data.overallScore)));
    this.evaluatorMode = data.evaluatorMode;
    this.summary = data.summary;
    this.criteria = data.criteria;
    this.feedbackItems = (data.feedbackItems || []).map(item => new FeedbackItem(item));
    this.evaluatedAt = data.evaluatedAt || new Date().toISOString();
  }

  public getGrade(): 'S' | 'A' | 'B' | 'C' | 'F' {
    if (this.overallScore >= 90) return 'S';
    if (this.overallScore >= 80) return 'A';
    if (this.overallScore >= 70) return 'B';
    if (this.overallScore >= 55) return 'C';
    return 'F';
  }

  public isFallback(): boolean {
    return this.evaluatorMode === 'RULE_BASED_FALLBACK';
  }

  public getStrengths(): FeedbackItem[] {
    return this.feedbackItems.filter(item => item.category === 'STRENGTH');
  }

  public getWeaknesses(): FeedbackItem[] {
    return this.feedbackItems.filter(item => item.category === 'WEAKNESS');
  }

  public getSOLIDObservations(): FeedbackItem[] {
    return this.feedbackItems.filter(item => item.category === 'SOLID_OBSERVATION');
  }
}
