import { ClassDefinition, ClassDefinitionData } from '../value-objects/ClassDefinition.ts';
import { RelationshipDefinition, RelationshipDefinitionData } from '../value-objects/RelationshipDefinition.ts';

export interface SubmissionData {
  id?: string;
  attemptId: string;
  classes: ClassDefinitionData[];
  relationships: RelationshipDefinitionData[];
  designPatterns?: string[];
  rationale?: string;
  codeSnippet?: string;
  mermaidDiagram?: string;
  submittedAt?: string;
}

export class Submission {
  public readonly id: string;
  public readonly attemptId: string;
  public readonly classes: ClassDefinition[];
  public readonly relationships: RelationshipDefinition[];
  public readonly designPatterns: string[];
  public readonly rationale: string;
  public readonly codeSnippet: string;
  public readonly mermaidDiagram: string;
  public readonly submittedAt: string;

  constructor(data: SubmissionData) {
    this.id = data.id || `sub-${Math.random().toString(36).substring(2, 9)}`;
    this.attemptId = data.attemptId;
    this.classes = (data.classes || []).map(c => new ClassDefinition(c));
    this.relationships = (data.relationships || []).map(r => new RelationshipDefinition(r));
    this.designPatterns = data.designPatterns || [];
    this.rationale = data.rationale || '';
    this.codeSnippet = data.codeSnippet || '';
    this.mermaidDiagram = data.mermaidDiagram || '';
    this.submittedAt = data.submittedAt || new Date().toISOString();
  }

  public isEmpty(): boolean {
    return this.classes.length === 0 && this.rationale.trim().length === 0 && this.codeSnippet.trim().length === 0;
  }

  public getClassCount(): number {
    return this.classes.length;
  }

  public getClassNames(): string[] {
    return this.classes.map(c => c.name);
  }

  public getInterfacesAndAbstractClasses(): ClassDefinition[] {
    return this.classes.filter(c => c.isInterfaceOrAbstract());
  }

  public generateMermaidDiagram(): string {
    if (this.mermaidDiagram && this.mermaidDiagram.trim().length > 0) {
      return this.mermaidDiagram;
    }

    const lines: string[] = ['classDiagram'];
    for (const cls of this.classes) {
      if (cls.stereotype === 'Interface') {
        lines.push(`class ${cls.name} {\n  <<Interface>>\n}`);
      } else if (cls.stereotype === 'AbstractClass') {
        lines.push(`class ${cls.name} {\n  <<Abstract>>\n}`);
      } else {
        lines.push(`class ${cls.name}`);
      }
      for (const meth of cls.methods) {
        lines.push(`${cls.name} : +${meth.name}(${meth.parameters || ''}) ${meth.returnType}`);
      }
    }
    for (const rel of this.relationships) {
      lines.push(rel.toMermaidSyntax());
    }
    return lines.join('\n');
  }

  public toNormalizedText(): string {
    const classSummaries = this.classes.map(c => c.toSummaryText()).join('\n');
    const relSummaries = this.relationships.map(r => `${r.source} -> [${r.type}] -> ${r.target}`).join('\n');
    const patternSummary = this.designPatterns.join(', ');

    return `
CLASSES:
${classSummaries || 'None'}

RELATIONSHIPS:
${relSummaries || 'None'}

DESIGN PATTERNS IDENTIFIED:
${patternSummary || 'None'}

DESIGN RATIONALE & TRADE-OFFS:
${this.rationale || 'None provided'}

CODE SNIPPET:
${this.codeSnippet || 'None provided'}
    `.trim();
  }
}
