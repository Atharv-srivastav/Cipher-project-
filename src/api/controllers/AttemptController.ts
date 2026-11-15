import { Request, Response } from 'express';
import { StartAttemptUseCase } from '../../application/use-cases/StartAttemptUseCase.ts';
import { SaveDraftUseCase } from '../../application/use-cases/SaveDraftUseCase.ts';
import { SubmitAttemptUseCase } from '../../application/use-cases/SubmitAttemptUseCase.ts';
import { GetAttemptHistoryUseCase } from '../../application/use-cases/GetAttemptHistoryUseCase.ts';
import { IAttemptRepository } from '../../domain/repositories/IAttemptRepository.ts';

export class AttemptController {
  constructor(
    private attemptRepo: IAttemptRepository,
    private startAttemptUseCase: StartAttemptUseCase,
    private saveDraftUseCase: SaveDraftUseCase,
    private submitAttemptUseCase: SubmitAttemptUseCase,
    private historyUseCase: GetAttemptHistoryUseCase
  ) {}

  public startAttempt = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId = 'user-101', problemId } = req.body;
      if (!problemId) {
        res.status(400).json({ success: false, error: 'problemId is required' });
        return;
      }
      const attempt = await this.startAttemptUseCase.execute(userId, problemId);
      res.status(201).json({ success: true, data: attempt });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err?.message || 'Error starting attempt' });
    }
  };

  public getAttempt = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const attempt = await this.attemptRepo.findById(id);
      if (!attempt) {
        res.status(404).json({ success: false, error: 'Attempt not found' });
        return;
      }
      res.json({ success: true, data: attempt });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  };

  public saveDraft = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const submissionData = req.body;
      const attempt = await this.saveDraftUseCase.execute(id, submissionData);
      res.json({ success: true, message: 'Draft saved', data: attempt });
    } catch (err: any) {
      const msg = err?.message || 'Error saving draft';
      if (msg.includes('not found')) {
        res.status(404).json({ success: false, error: msg });
      } else if (msg.includes('Cannot modify draft while attempt status is')) {
        res.status(409).json({ success: false, error: msg });
      } else {
        res.status(400).json({ success: false, error: msg });
      }
    }
  };

  public submit = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const attempt = await this.submitAttemptUseCase.execute(id);
      res.json({ success: true, data: attempt });
    } catch (err: any) {
      const msg = err?.message || 'Error submitting attempt';
      if (msg.includes('not found')) {
        res.status(404).json({ success: false, error: msg });
      } else if (msg.includes('Cannot submit an empty attempt')) {
        res.status(422).json({ success: false, error: msg });
      } else if (msg.includes('already being evaluated')) {
        res.status(409).json({ success: false, error: msg });
      } else {
        res.status(400).json({ success: false, error: msg });
      }
    }
  };

  public retryEvaluation = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const attempt = await this.submitAttemptUseCase.execute(id);
      res.json({ success: true, data: attempt });
    } catch (err: any) {
      const msg = err?.message || 'Error retrying evaluation';
      if (msg.includes('not found')) {
        res.status(404).json({ success: false, error: msg });
      } else {
        res.status(400).json({ success: false, error: msg });
      }
    }
  };

  public getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.query.userId as string) || 'user-101';
      const history = await this.historyUseCase.execute(userId);
      res.json({ success: true, data: history });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  };
}
