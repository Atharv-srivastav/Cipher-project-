import { describe, it, expect } from 'vitest';
import { Attempt } from '../../src/domain/entities/Attempt.ts';
import { Submission } from '../../src/domain/entities/Submission.ts';
import { Evaluation } from '../../src/domain/entities/Evaluation.ts';

describe('Attempt Entity & State Machine', () => {
  it('should initialize attempt in DRAFT status', () => {
    const attempt = new Attempt({
      userId: 'user-101',
      problemId: 'prob-parking-lot',
      attemptNumber: 1,
      status: 'DRAFT',
    });

    expect(attempt.status).toBe('DRAFT');
    expect(attempt.attemptNumber).toBe(1);
    expect(attempt.submission).toBeUndefined();
  });

  it('should update draft successfully', () => {
    const attempt = new Attempt({
      userId: 'user-101',
      problemId: 'prob-parking-lot',
      attemptNumber: 1,
      status: 'DRAFT',
    });

    attempt.updateDraft({
      classes: [{ id: 'c1', name: 'ParkingLot', stereotype: 'Entity', responsibilities: 'Manages lot', attributes: [], methods: [] }],
      relationships: [],
      rationale: 'Initial draft design',
    });

    expect(attempt.submission).toBeDefined();
    expect(attempt.submission?.getClassCount()).toBe(1);
    expect(attempt.submission?.getClassNames()).toContain('ParkingLot');
  });

  it('should transition through state machine correctly on submission and completion', () => {
    const attempt = new Attempt({
      userId: 'user-101',
      problemId: 'prob-parking-lot',
      attemptNumber: 1,
      status: 'DRAFT',
    });

    attempt.updateDraft({
      classes: [{ id: 'c1', name: 'ParkingLot', stereotype: 'Entity', responsibilities: 'Core lot', attributes: [], methods: [] }],
      relationships: [],
    });

    // 1. Submit
    attempt.submit();
    expect(attempt.status).toBe('SUBMITTED');

    // 2. Start evaluation
    attempt.startEvaluation();
    expect(attempt.status).toBe('EVALUATING');

    // 3. Complete evaluation
    const evalData = new Evaluation({
      attemptId: attempt.id,
      overallScore: 85,
      evaluatorMode: 'HYBRID_AI',
      summary: 'Good attempt',
      criteria: { responsibilities: 8, abstraction: 8, coupling: 8, solid: 8, designPatterns: 8, extensibility: 8 },
      feedbackItems: [],
    });

    attempt.completeEvaluation(evalData);
    expect(attempt.status).toBe('EVALUATED');
    expect(attempt.evaluation?.overallScore).toBe(85);
  });

  it('should throw error when submitting an empty attempt', () => {
    const attempt = new Attempt({
      userId: 'user-101',
      problemId: 'prob-parking-lot',
      attemptNumber: 1,
      status: 'DRAFT',
    });

    expect(() => attempt.submit()).toThrow('Cannot submit an empty attempt');
  });
});
