import { IAttemptRepository } from '../../domain/repositories/IAttemptRepository.ts';
import { IProblemRepository } from '../../domain/repositories/IProblemRepository.ts';

export interface HistoryItemDto {
  attemptId: string;
  problemId: string;
  problemTitle: string;
  attemptNumber: number;
  status: string;
  score?: number;
  evaluatorMode?: string;
  summary?: string;
  submittedAt?: string;
  updatedAt: string;
}

export class GetAttemptHistoryUseCase {
  constructor(
    private attemptRepo: IAttemptRepository,
    private problemRepo: IProblemRepository
  ) {}

  public async execute(userId: string): Promise<HistoryItemDto[]> {
    const attempts = await this.attemptRepo.findAllByUser(userId);
    const problems = await this.problemRepo.findAll();
    const problemMap = new Map(problems.map(p => [p.id, p]));

    return attempts.map(att => {
      const prob = problemMap.get(att.problemId);
      return {
        attemptId: att.id,
        problemId: att.problemId,
        problemTitle: prob ? prob.title : 'Unknown Problem',
        attemptNumber: att.attemptNumber,
        status: att.status,
        score: att.evaluation?.overallScore,
        evaluatorMode: att.evaluation?.evaluatorMode,
        summary: att.evaluation?.summary,
        submittedAt: att.submission?.submittedAt,
        updatedAt: att.updatedAt,
      };
    });
  }
}
