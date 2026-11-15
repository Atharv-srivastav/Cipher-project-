export type ProblemDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface ProblemData {
  id: string;
  title: string;
  slug: string;
  difficulty: ProblemDifficulty;
  shortDescription: string;
  requirements: string[];
  expectedEntities: string[];
  tags?: string[];
  estimatedMinutes?: number;
}

export class Problem {
  public readonly id: string;
  public readonly title: string;
  public readonly slug: string;
  public readonly difficulty: ProblemDifficulty;
  public readonly shortDescription: string;
  public readonly requirements: string[];
  public readonly expectedEntities: string[];
  public readonly tags: string[];
  public readonly estimatedMinutes: number;

  constructor(data: ProblemData) {
    this.id = data.id;
    this.title = data.title;
    this.slug = data.slug;
    this.difficulty = data.difficulty;
    this.shortDescription = data.shortDescription;
    this.requirements = data.requirements || [];
    this.expectedEntities = data.expectedEntities || [];
    this.tags = data.tags || [];
    this.estimatedMinutes = data.estimatedMinutes || 30;
  }

  public getMissingEntities(candidateClassNames: string[]): string[] {
    const lowerCandidates = candidateClassNames.map(c => c.toLowerCase());
    return this.expectedEntities.filter(e => !lowerCandidates.includes(e.toLowerCase()));
  }
}
