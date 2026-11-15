import { describe, it, expect } from 'vitest';
import { EvaluationAggregator } from '../../src/infrastructure/evaluation/EvaluationAggregator.ts';
import { Submission } from '../../src/domain/entities/Submission.ts';
import { Problem } from '../../src/domain/entities/Problem.ts';

describe('EvaluationAggregator Fallback Verification', () => {
  const aggregator = new EvaluationAggregator();
  const sampleProblem = new Problem({
    id: 'prob-vending-machine',
    title: 'Design a Vending Machine',
    slug: 'design-vending-machine',
    difficulty: 'EASY',
    shortDescription: 'State machine vending machine',
    requirements: ['States', 'Dispense item'],
    expectedEntities: ['VendingMachine', 'State'],
  });

  it('should fall back to FallbackEvaluator when LLM API key is unconfigured', async () => {
    // Ensure GEMINI_API_KEY is not set for this test
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const submission = new Submission({
      attemptId: 'att-fallback-test',
      classes: [
        { id: 'c1', name: 'VendingMachine', stereotype: 'Entity', responsibilities: 'Vending context', attributes: [], methods: [] },
        { id: 'c2', name: 'State', stereotype: 'Interface', responsibilities: 'State interface', attributes: [], methods: [] },
      ],
      relationships: [],
      rationale: 'Used state pattern for vending machine states',
    });

    const evalResult = await aggregator.evaluateSubmission('att-fallback-test', submission, sampleProblem);
    expect(evalResult.evaluatorMode).toBe('RULE_BASED_FALLBACK');
    expect(evalResult.overallScore).toBeGreaterThan(0);
    expect(evalResult.feedbackItems.some(f => f.title.includes('Fallback Active'))).toBe(true);

    process.env.GEMINI_API_KEY = origKey;
  });
});
