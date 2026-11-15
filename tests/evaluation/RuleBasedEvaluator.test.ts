import { describe, it, expect } from 'vitest';
import { RuleBasedEvaluator } from '../../src/infrastructure/evaluation/RuleBasedEvaluator.ts';
import { Submission } from '../../src/domain/entities/Submission.ts';
import { Problem } from '../../src/domain/entities/Problem.ts';

describe('RuleBasedEvaluator Unit Tests', () => {
  const evaluator = new RuleBasedEvaluator();
  const sampleProblem = new Problem({
    id: 'prob-parking-lot',
    title: 'Design a Parking Lot',
    slug: 'design-parking-lot',
    difficulty: 'MEDIUM',
    shortDescription: 'Design parking lot',
    requirements: ['Multiple spots', 'Pricing'],
    expectedEntities: ['ParkingLot', 'ParkingSpot', 'Vehicle', 'SpotAssignmentStrategy'],
  });

  it('should return score 0 for empty submission', async () => {
    const emptySubmission = new Submission({
      attemptId: 'att-1',
      classes: [],
      relationships: [],
    });

    const evalResult = await evaluator.evaluate('att-1', emptySubmission, sampleProblem);
    expect(evalResult.overallScore).toBe(0);
    expect(evalResult.evaluatorMode).toBe('RULE_BASED_ONLY');
  });

  it('should penalize missing expected entities', async () => {
    const incompleteSubmission = new Submission({
      attemptId: 'att-2',
      classes: [
        { id: 'c1', name: 'ParkingLot', stereotype: 'Entity', responsibilities: 'Lot', attributes: [], methods: [] },
      ],
      relationships: [],
    });

    const evalResult = await evaluator.evaluate('att-2', incompleteSubmission, sampleProblem);
    const missingItems = evalResult.feedbackItems.filter(f => f.title === 'Missing Core Domain Entities');
    expect(missingItems.length).toBeGreaterThan(0);
    expect(missingItems[0].description).toContain('SpotAssignmentStrategy');
  });

  it('should reward usage of interfaces and abstract classes', async () => {
    const completeSubmission = new Submission({
      attemptId: 'att-3',
      classes: [
        { id: 'c1', name: 'ParkingLot', stereotype: 'Entity', responsibilities: 'Lot', attributes: [], methods: [] },
        { id: 'c2', name: 'ParkingSpot', stereotype: 'Entity', responsibilities: 'Spot', attributes: [], methods: [] },
        { id: 'c3', name: 'Vehicle', stereotype: 'Entity', responsibilities: 'Vehicle', attributes: [], methods: [] },
        { id: 'c4', name: 'SpotAssignmentStrategy', stereotype: 'Interface', responsibilities: 'Strategy interface', attributes: [], methods: [] },
      ],
      relationships: [
        { id: 'r1', source: 'ParkingLot', target: 'SpotAssignmentStrategy', type: 'Association' },
      ],
      designPatterns: ['Strategy Pattern'],
    });

    const evalResult = await evaluator.evaluate('att-3', completeSubmission, sampleProblem);
    expect(evalResult.overallScore).toBeGreaterThan(70);
    expect(evalResult.criteria.abstraction).toBeGreaterThanOrEqual(8);
  });
});
