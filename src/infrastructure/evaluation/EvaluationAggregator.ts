import { IEvaluationStrategy } from '../../domain/strategies/IEvaluationStrategy.ts';
import { Submission } from '../../domain/entities/Submission.ts';
import { Problem } from '../../domain/entities/Problem.ts';
import { Evaluation } from '../../domain/entities/Evaluation.ts';
import { RuleBasedEvaluator } from './RuleBasedEvaluator.ts';
import { LLMEvaluator } from './LLMEvaluator.ts';
import { FallbackEvaluator } from './FallbackEvaluator.ts';

export class EvaluationAggregator {
  private ruleEvaluator = new RuleBasedEvaluator();
  private llmEvaluator = new LLMEvaluator();
  private fallbackEvaluator = new FallbackEvaluator();

  public async evaluateSubmission(attemptId: string, submission: Submission, problem: Problem): Promise<Evaluation> {
    // 1. Run deterministic rule-based evaluation first
    const ruleResult = await this.ruleEvaluator.evaluate(attemptId, submission, problem);

    // If submission is empty or failed basic structural checks, return rule result immediately
    if (submission.isEmpty() || ruleResult.overallScore === 0) {
      return ruleResult;
    }

    // 2. Try LLM Evaluator with automatic Fallback catch
    try {
      const llmResult = await this.llmEvaluator.evaluate(attemptId, submission, problem);
      
      // Combine deterministic items with LLM feedback if missing
      return llmResult;
    } catch (error: any) {
      console.warn(`[EvaluationAggregator] LLM Evaluator failed (${error?.message}). Falling back to FallbackEvaluator.`);
      return await this.fallbackEvaluator.evaluate(attemptId, submission, problem);
    }
  }
}
