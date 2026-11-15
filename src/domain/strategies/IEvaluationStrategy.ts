import { Submission } from '../entities/Submission.ts';
import { Problem } from '../entities/Problem.ts';
import { Evaluation } from '../entities/Evaluation.ts';

export interface IEvaluationStrategy {
  readonly id: string;
  readonly name: string;
  evaluate(attemptId: string, submission: Submission, problem: Problem): Promise<Evaluation>;
}
