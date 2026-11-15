export type RelationshipType =
  | 'Inheritance'
  | 'Composition'
  | 'Aggregation'
  | 'Association'
  | 'Realization';

export interface RelationshipDefinitionData {
  id?: string;
  source: string;
  target: string;
  type: RelationshipType;
  multiplicity?: string;
}

export class RelationshipDefinition {
  public readonly id: string;
  public readonly source: string;
  public readonly target: string;
  public readonly type: RelationshipType;
  public readonly multiplicity: string;

  constructor(data: RelationshipDefinitionData) {
    if (!data.source || !data.target) {
      throw new Error('Relationship source and target classes must be specified');
    }
    this.id = data.id || `rel-${Math.random().toString(36).substring(2, 9)}`;
    this.source = data.source.trim();
    this.target = data.target.trim();
    this.type = data.type;
    this.multiplicity = data.multiplicity || '1';
  }

  public isRealizationOrInheritance(): boolean {
    return this.type === 'Inheritance' || this.type === 'Realization';
  }

  public toMermaidSyntax(): string {
    switch (this.type) {
      case 'Inheritance':
        return `${this.target} <|-- ${this.source}`;
      case 'Realization':
        return `${this.target} <|.. ${this.source}`;
      case 'Composition':
        return `${this.source} *-- "${this.multiplicity}" ${this.target}`;
      case 'Aggregation':
        return `${this.source} o-- "${this.multiplicity}" ${this.target}`;
      case 'Association':
      default:
        return `${this.source} --> "${this.multiplicity}" ${this.target}`;
    }
  }
}
