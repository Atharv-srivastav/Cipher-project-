import { describe, it, expect } from 'vitest';
import { InMemoryProblemRepository } from '../../src/infrastructure/persistence/InMemoryProblemRepository.ts';
import { GetProblemsUseCase } from '../../src/application/use-cases/GetProblemsUseCase.ts';
import { SEED_PROBLEMS_DATA } from '../../src/domain/data/problemsData.ts';

describe('Problem Catalog Domain & Repository Test Suite', () => {
  const repo = new InMemoryProblemRepository();
  const getProblemsUseCase = new GetProblemsUseCase(repo);

  it('should seed all defined problems correctly', async () => {
    const problems = await getProblemsUseCase.execute();
    expect(problems.length).toBe(SEED_PROBLEMS_DATA.length);
    expect(problems.length).toBeGreaterThanOrEqual(7);
  });

  it('should verify each problem has valid required fields and non-empty metadata', async () => {
    const problems = await getProblemsUseCase.execute();

    for (const prob of problems) {
      expect(prob.id).toBeDefined();
      expect(prob.id.length).toBeGreaterThan(0);
      expect(prob.title).toBeDefined();
      expect(prob.title.length).toBeGreaterThan(0);
      expect(prob.slug).toBeDefined();
      expect(prob.slug.length).toBeGreaterThan(0);
      expect(['EASY', 'MEDIUM', 'HARD']).toContain(prob.difficulty);
      expect(prob.shortDescription).toBeDefined();
      expect(prob.shortDescription.length).toBeGreaterThan(10);
      expect(Array.isArray(prob.requirements)).toBe(true);
      expect(prob.requirements.length).toBeGreaterThan(0);
      expect(Array.isArray(prob.expectedEntities)).toBe(true);
      expect(prob.expectedEntities.length).toBeGreaterThan(0);
      expect(Array.isArray(prob.tags)).toBe(true);
      expect(prob.tags.length).toBeGreaterThan(0);
      expect(prob.estimatedMinutes).toBeGreaterThan(0);
    }
  });

  it('should fetch problem by ID and slug successfully', async () => {
    const parkingLotById = await getProblemsUseCase.getById('prob-parking-lot');
    expect(parkingLotById).toBeDefined();
    expect(parkingLotById?.title).toBe('Design a Parking Lot');

    const elevatorBySlug = await getProblemsUseCase.getById('design-elevator-system');
    expect(elevatorBySlug).toBeDefined();
    expect(elevatorBySlug?.id).toBe('prob-elevator');
    expect(elevatorBySlug?.difficulty).toBe('HARD');
  });

  it('should return null for non-existent problem ID or slug', async () => {
    const notFound = await getProblemsUseCase.getById('non-existent-problem-id');
    expect(notFound).toBeNull();
  });

  it('should correctly identify missing entities case-insensitively', async () => {
    const parkingLot = await getProblemsUseCase.getById('prob-parking-lot');
    expect(parkingLot).toBeDefined();

    const candidateClasses = ['parkinglot', 'vehicle', 'ticket'];
    const missing = parkingLot!.getMissingEntities(candidateClasses);

    expect(missing).not.toContain('ParkingLot');
    expect(missing).not.toContain('Vehicle');
    expect(missing).not.toContain('Ticket');
    expect(missing).toContain('ParkingFloor');
    expect(missing).toContain('ParkingSpot');
    expect(missing).toContain('PaymentService');
    expect(missing).toContain('SpotAssignmentStrategy');
  });

  it('should cover all three difficulty tiers (EASY, MEDIUM, HARD)', async () => {
    const problems = await getProblemsUseCase.execute();
    const difficulties = new Set(problems.map(p => p.difficulty));

    expect(difficulties.has('EASY')).toBe(true);
    expect(difficulties.has('MEDIUM')).toBe(true);
    expect(difficulties.has('HARD')).toBe(true);
  });
});

