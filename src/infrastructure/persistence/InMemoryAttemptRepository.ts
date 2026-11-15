import { Attempt } from '../../domain/entities/Attempt.ts';
import { IAttemptRepository } from '../../domain/repositories/IAttemptRepository.ts';

export class InMemoryAttemptRepository implements IAttemptRepository {
  private attempts: Map<string, Attempt> = new Map();

  public async findById(id: string): Promise<Attempt | null> {
    return this.attempts.get(id) || null;
  }

  public async findByUserAndProblem(userId: string, problemId: string): Promise<Attempt[]> {
    return Array.from(this.attempts.values()).filter(
      a => a.userId === userId && a.problemId === problemId
    ).sort((a, b) => b.attemptNumber - a.attemptNumber);
  }

  public async findAllByUser(userId: string): Promise<Attempt[]> {
    return Array.from(this.attempts.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public async save(attempt: Attempt): Promise<Attempt> {
    this.attempts.set(attempt.id, attempt);
    return attempt;
  }

  public async getNextAttemptNumber(userId: string, problemId: string): Promise<number> {
    const existing = await this.findByUserAndProblem(userId, problemId);
    return existing.length + 1;
  }
}
