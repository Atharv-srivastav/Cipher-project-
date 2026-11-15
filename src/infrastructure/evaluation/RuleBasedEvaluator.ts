import { IEvaluationStrategy } from '../../domain/strategies/IEvaluationStrategy.ts';
import { Submission } from '../../domain/entities/Submission.ts';
import { Problem } from '../../domain/entities/Problem.ts';
import { Evaluation } from '../../domain/entities/Evaluation.ts';
import { FeedbackItemData } from '../../domain/value-objects/FeedbackCriterion.ts';

export class RuleBasedEvaluator implements IEvaluationStrategy {
  public readonly id = 'rule-based-evaluator';
  public readonly name = 'Rule-Based Structural Evaluator';

  public async evaluate(attemptId: string, submission: Submission, problem: Problem): Promise<Evaluation> {
    const feedbackItems: FeedbackItemData[] = [];
    const classCount = submission.getClassCount();
    const classNames = submission.getClassNames();
    const missingEntities = problem.getMissingEntities(classNames);
    const interfaces = submission.getInterfacesAndAbstractClasses();

    // 1. Structural Checks
    if (classCount === 0) {
      return new Evaluation({
        attemptId,
        overallScore: 0,
        evaluatorMode: 'RULE_BASED_ONLY',
        summary: 'Submission failed basic structural validation. No classes or entities defined.',
        criteria: {
          responsibilities: 0,
          abstraction: 0,
          coupling: 0,
          solid: 0,
          designPatterns: 0,
          extensibility: 0,
        },
        feedbackItems: [
          {
            category: 'WEAKNESS',
            title: 'Empty Submission',
            description: 'No domain classes were defined in the submission.',
          },
        ],
      });
    }

    // 2. Score Computation heuristics
    let respScore = Math.min(10, 4 + classCount);
    let absScore = interfaces.length > 0 ? 8 : 4;
    let solidScore = 6;
    let patternScore = submission.designPatterns.length > 0 ? 8 : 4;
    let extensibilityScore = 6;
    let couplingScore = 7;

    // Deductions & Feedback Items
    if (missingEntities.length > 0) {
      respScore = Math.max(2, respScore - missingEntities.length * 1.5);
      feedbackItems.push({
        category: 'WEAKNESS',
        title: 'Missing Core Domain Entities',
        description: `Your design appears to be missing key domain entities expected for ${problem.title}: [${missingEntities.join(', ')}].`,
        evidence: `Extracted classes: [${classNames.join(', ')}]`,
      });
    } else {
      feedbackItems.push({
        category: 'STRENGTH',
        title: 'Complete Core Entity Coverage',
        description: `All expected domain entities for ${problem.title} were identified in your design.`,
        evidence: `Found entities: [${classNames.join(', ')}]`,
      });
    }

    if (interfaces.length === 0) {
      feedbackItems.push({
        category: 'SOLID_OBSERVATION',
        title: 'Interface Segregation Opportunity (DIP / ISP)',
        description: 'No Interfaces or Abstract classes were declared. Consider introducing abstractions to decouple implementations.',
      });
    } else {
      absScore = Math.min(10, absScore + 2);
      feedbackItems.push({
        category: 'STRENGTH',
        title: 'Good Use of Abstraction',
        description: `Defined ${interfaces.length} interface(s)/abstract class(es): [${interfaces.map(i => i.name).join(', ')}].`,
      });
    }

    if (submission.designPatterns.length > 0) {
      feedbackItems.push({
        category: 'PATTERN_SUGGESTION',
        title: 'Design Pattern Recognized',
        description: `Applied design pattern(s): ${submission.designPatterns.join(', ')}.`,
        evidence: submission.rationale.substring(0, 100),
      });
    }

    const overallScore = Math.round(
      (respScore * 0.25 +
        absScore * 0.20 +
        couplingScore * 0.15 +
        solidScore * 0.15 +
        patternScore * 0.15 +
        extensibilityScore * 0.10) * 10
    );

    return new Evaluation({
      attemptId,
      overallScore,
      evaluatorMode: 'RULE_BASED_ONLY',
      summary: `Deterministic structural check completed with ${classCount} classes and ${submission.relationships.length} relationships.`,
      criteria: {
        responsibilities: Math.round(respScore),
        abstraction: Math.round(absScore),
        coupling: Math.round(couplingScore),
        solid: Math.round(solidScore),
        designPatterns: Math.round(patternScore),
        extensibility: Math.round(extensibilityScore),
      },
      feedbackItems,
    });
  }
}
