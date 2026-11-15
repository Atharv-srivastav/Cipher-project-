import { describe, it, expect } from 'vitest';
import { InMemoryProblemRepository } from '../../src/infrastructure/persistence/InMemoryProblemRepository.ts';
import { InMemoryAttemptRepository } from '../../src/infrastructure/persistence/InMemoryAttemptRepository.ts';
import { GetProblemsUseCase } from '../../src/application/use-cases/GetProblemsUseCase.ts';
import { StartAttemptUseCase } from '../../src/application/use-cases/StartAttemptUseCase.ts';
import { SubmitAttemptUseCase } from '../../src/application/use-cases/SubmitAttemptUseCase.ts';

describe('API & Application Use Cases End-to-End Test Suite', () => {
  const problemRepo = new InMemoryProblemRepository();
  const attemptRepo = new InMemoryAttemptRepository();

  const getProblems = new GetProblemsUseCase(problemRepo);
  const startAttempt = new StartAttemptUseCase(attemptRepo, problemRepo);
  const submitAttempt = new SubmitAttemptUseCase(attemptRepo, problemRepo);

  it('should retrieve seeded problem list', async () => {
    const problems = await getProblems.execute();
    expect(problems.length).toBeGreaterThanOrEqual(5);
    const parkingLot = problems.find(p => p.id === 'prob-parking-lot');
    expect(parkingLot).toBeDefined();
    expect(parkingLot?.requirements.length).toBeGreaterThan(0);
    expect(parkingLot?.tags).toContain('Strategy Pattern');
    expect(parkingLot?.estimatedMinutes).toBe(45);
  });

  it('should start attempt, save draft, submit, and generate evaluation', async () => {
    // 1. Start Attempt
    const attempt = await startAttempt.execute('user-101', 'prob-parking-lot');
    expect(attempt.id).toBeDefined();
    expect(attempt.status).toBe('DRAFT');

    // 2. Update Draft
    attempt.updateDraft({
      classes: [
        { id: 'c1', name: 'ParkingLot', stereotype: 'Entity', responsibilities: 'Core Lot', attributes: [], methods: [] },
        { id: 'c2', name: 'SpotAssignmentStrategy', stereotype: 'Interface', responsibilities: 'Spot finding strategy', attributes: [], methods: [] },
      ],
      relationships: [
        { id: 'r1', source: 'ParkingLot', target: 'SpotAssignmentStrategy', type: 'Association' },
      ],
      rationale: 'Strategy pattern for flexible spot assignment',
    });
    await attemptRepo.save(attempt);

    // 3. Submit Attempt
    const completedAttempt = await submitAttempt.execute(attempt.id);
    expect(completedAttempt.status).toBe('EVALUATED');
    expect(completedAttempt.evaluation).toBeDefined();
    expect(completedAttempt.evaluation?.overallScore).toBeGreaterThan(0);
    expect(completedAttempt.evaluation?.feedbackItems.length).toBeGreaterThan(0);
  });
});
