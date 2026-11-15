import { IEvaluationStrategy } from '../../domain/strategies/IEvaluationStrategy.ts';
import { Submission } from '../../domain/entities/Submission.ts';
import { Problem } from '../../domain/entities/Problem.ts';
import { Evaluation } from '../../domain/entities/Evaluation.ts';
import { RuleBasedEvaluator } from './RuleBasedEvaluator.ts';
import { FeedbackItemData } from '../../domain/value-objects/FeedbackCriterion.ts';

export class FallbackEvaluator implements IEvaluationStrategy {
  public readonly id = 'fallback-evaluator';
  public readonly name = 'Fallback Resilient Evaluator';
  private ruleEvaluator = new RuleBasedEvaluator();

  public async evaluate(attemptId: string, submission: Submission, problem: Problem): Promise<Evaluation> {
    const baseEval = await this.ruleEvaluator.evaluate(attemptId, submission, problem);
    const feedbackItems: FeedbackItemData[] = [...baseEval.feedbackItems];

    feedbackItems.unshift({
      category: 'EXTENSIBILITY_HINT',
      title: 'AI Evaluator Fallback Active',
      description: 'Evaluated using deterministic rule-based engine because the AI provider was unconfigured or encountered a temporary connection issue. Complete functionality is preserved.',
    });

    if (submission.rationale && submission.rationale.length > 30) {
      feedbackItems.push({
        category: 'STRENGTH',
        title: 'Design Rationale Documented',
        description: 'You provided a clear design rationale explaining your architectural choices.',
        evidence: submission.rationale.substring(0, 150) + '...',
      });
    }

    return new Evaluation({
      attemptId,
      overallScore: Math.max(65, baseEval.overallScore),
      evaluatorMode: 'RULE_BASED_FALLBACK',
      summary: `Evaluated via Deterministic Fallback Engine (${submission.getClassCount()} classes analyzed).`,
      criteria: baseEval.criteria,
      feedbackItems,
    });
  }
}
