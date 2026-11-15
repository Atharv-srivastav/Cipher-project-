import { Attempt } from '../entities/Attempt.ts';

export interface IAttemptRepository {
  findById(id: string): Promise<Attempt | null>;
  findByUserAndProblem(userId: string, problemId: string): Promise<Attempt[]>;
  findAllByUser(userId: string): Promise<Attempt[]>;
  save(attempt: Attempt): Promise<Attempt>;
  getNextAttemptNumber(userId: string, problemId: string): Promise<number>;
}
