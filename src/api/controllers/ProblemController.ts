import { Request, Response } from 'express';
import { GetProblemsUseCase } from '../../application/use-cases/GetProblemsUseCase.ts';

export class ProblemController {
  constructor(private getProblemsUseCase: GetProblemsUseCase) {}

  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const problems = await this.getProblemsUseCase.execute();
      res.json({
        success: true,
        data: problems.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          difficulty: p.difficulty,
          shortDescription: p.shortDescription,
          requirements: p.requirements,
          expectedEntities: p.expectedEntities,
          tags: p.tags,
          estimatedMinutes: p.estimatedMinutes,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Server Error' });
    }
  };

  public getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const problem = await this.getProblemsUseCase.getById(id);
      if (!problem) {
        res.status(404).json({ success: false, error: 'Problem not found' });
        return;
      }
      res.json({ success: true, data: problem });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Server Error' });
    }
  };
}
