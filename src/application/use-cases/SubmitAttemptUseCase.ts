import { IAttemptRepository } from '../../domain/repositories/IAttemptRepository.ts';
import { IProblemRepository } from '../../domain/repositories/IProblemRepository.ts';
import { EvaluationAggregator } from '../../infrastructure/evaluation/EvaluationAggregator.ts';
import { Attempt } from '../../domain/entities/Attempt.ts';

export class SubmitAttemptUseCase {
  private aggregator = new EvaluationAggregator();

  constructor(
    private attemptRepo: IAttemptRepository,
    private problemRepo: IProblemRepository
  ) {}

  public async execute(attemptId: string): Promise<Attempt> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt with ID ${attemptId} not found`);
    }

    const problem = await this.problemRepo.findById(attempt.problemId);
    if (!problem) {
      throw new Error(`Problem with ID ${attempt.problemId} not found`);
    }

    // State machine transitions: SUBMITTED -> EVALUATING
    attempt.submit();
    attempt.startEvaluation();
    await this.attemptRepo.save(attempt);

    try {
      const evaluation = await this.aggregator.evaluateSubmission(
        attempt.id,
        attempt.submission!,
        problem
      );
      attempt.completeEvaluation(evaluation);
    } catch (err) {
      attempt.failEvaluation();
      console.error(`[SubmitAttemptUseCase] Evaluation failed for attempt ${attemptId}:`, err);
    }

    return await this.attemptRepo.save(attempt);
  }
}
