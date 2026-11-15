import { Problem } from '../../domain/entities/Problem.ts';
import { IProblemRepository } from '../../domain/repositories/IProblemRepository.ts';
import { SEED_PROBLEMS_DATA } from '../../domain/data/problemsData.ts';

export class InMemoryProblemRepository implements IProblemRepository {
  private problems: Map<string, Problem> = new Map();

  constructor() {
    for (const probData of SEED_PROBLEMS_DATA) {
      const prob = new Problem(probData);
      this.problems.set(prob.id, prob);
    }
  }

  public async findAll(): Promise<Problem[]> {
    return Array.from(this.problems.values());
  }

  public async findById(id: string): Promise<Problem | null> {
    return this.problems.get(id) || null;
  }

  public async findBySlug(slug: string): Promise<Problem | null> {
    for (const prob of this.problems.values()) {
      if (prob.slug === slug) return prob;
    }
    return null;
  }
}
