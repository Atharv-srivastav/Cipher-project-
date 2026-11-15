import { Submission, SubmissionData } from './Submission.ts';
import { Evaluation, EvaluationData } from './Evaluation.ts';

export type AttemptStatus = 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'EVALUATED' | 'FAILED';

export interface AttemptData {
  id?: string;
  userId: string;
  problemId: string;
  attemptNumber: number;
  status: AttemptStatus;
  submission?: SubmissionData;
  evaluation?: EvaluationData;
  createdAt?: string;
  updatedAt?: string;
}

export class Attempt {
  public readonly id: string;
  public readonly userId: string;
  public readonly problemId: string;
  public readonly attemptNumber: number;
  private _status: AttemptStatus;
  private _submission?: Submission;
  private _evaluation?: Evaluation;
  public readonly createdAt: string;
  private _updatedAt: string;

  constructor(data: AttemptData) {
    this.id = data.id || `att-${Math.random().toString(36).substring(2, 9)}`;
    this.userId = data.userId;
    this.problemId = data.problemId;
    this.attemptNumber = data.attemptNumber || 1;
    this._status = data.status || 'DRAFT';
    this._submission = data.submission ? new Submission(data.submission) : undefined;
    this._evaluation = data.evaluation ? new Evaluation(data.evaluation) : undefined;
    this.createdAt = data.createdAt || new Date().toISOString();
    this._updatedAt = data.updatedAt || new Date().toISOString();
  }

  public get status(): AttemptStatus {
    return this._status;
  }

  public get submission(): Submission | undefined {
    return this._submission;
  }

  public get evaluation(): Evaluation | undefined {
    return this._evaluation;
  }

  public get updatedAt(): string {
    return this._updatedAt;
  }

  public updateDraft(submissionData: Omit<SubmissionData, 'attemptId'>): void {
    if (this._status === 'SUBMITTED' || this._status === 'EVALUATING') {
      throw new Error(`Cannot modify draft while attempt status is ${this._status}`);
    }
    this._submission = new Submission({
      ...submissionData,
      attemptId: this.id,
    });
    this._status = 'DRAFT';
    this._updatedAt = new Date().toISOString();
  }

  public submit(): void {
    if (this._status === 'EVALUATING') {
      throw new Error('Attempt is already being evaluated');
    }
    if (!this._submission || this._submission.isEmpty()) {
      throw new Error('Cannot submit an empty attempt');
    }
    this._status = 'SUBMITTED';
    this._updatedAt = new Date().toISOString();
  }

  public startEvaluation(): void {
    if (this._status !== 'SUBMITTED' && this._status !== 'FAILED') {
      throw new Error(`Cannot start evaluation for attempt in state ${this._status}`);
    }
    this._status = 'EVALUATING';
    this._updatedAt = new Date().toISOString();
  }

  public completeEvaluation(evaluation: Evaluation): void {
    if (this._status !== 'EVALUATING') {
      throw new Error(`Cannot complete evaluation when status is ${this._status}`);
    }
    this._evaluation = evaluation;
    this._status = 'EVALUATED';
    this._updatedAt = new Date().toISOString();
  }

  public failEvaluation(): void {
    this._status = 'FAILED';
    this._updatedAt = new Date().toISOString();
  }
}
