export type FeedbackCategory =
  | 'STRENGTH'
  | 'WEAKNESS'
  | 'SOLID_OBSERVATION'
  | 'PATTERN_SUGGESTION'
  | 'EXTENSIBILITY_HINT';

export interface FeedbackItemData {
  id?: string;
  category: FeedbackCategory;
  title: string;
  description: string;
  evidence?: string;
}

export class FeedbackItem {
  public readonly id: string;
  public readonly category: FeedbackCategory;
  public readonly title: string;
  public readonly description: string;
  public readonly evidence?: string;

  constructor(data: FeedbackItemData) {
    this.id = data.id || `fb-${Math.random().toString(36).substring(2, 9)}`;
    this.category = data.category;
    this.title = data.title;
    this.description = data.description;
    this.evidence = data.evidence;
  }
}

export interface CriteriaBreakdown {
  responsibilities: number; // 0-10
  abstraction: number;      // 0-10
  coupling: number;         // 0-10
  solid: number;            // 0-10
  designPatterns: number;   // 0-10
  extensibility: number;    // 0-10
}
