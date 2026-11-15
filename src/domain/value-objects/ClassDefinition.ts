export type ClassStereotype = 'Entity' | 'Interface' | 'AbstractClass' | 'Enum' | 'Service' | 'ValueObject';

export interface AttributeDefinition {
  name: string;
  type: string;
  visibility?: 'public' | 'private' | 'protected';
}

export interface MethodDefinition {
  name: string;
  returnType: string;
  parameters?: string;
  visibility?: 'public' | 'private' | 'protected';
}

export interface ClassDefinitionData {
  id: string;
  name: string;
  stereotype: ClassStereotype;
  responsibilities: string;
  attributes: AttributeDefinition[];
  methods: MethodDefinition[];
}

export class ClassDefinition {
  public readonly id: string;
  public readonly name: string;
  public readonly stereotype: ClassStereotype;
  public readonly responsibilities: string;
  public readonly attributes: AttributeDefinition[];
  public readonly methods: MethodDefinition[];

  constructor(data: ClassDefinitionData) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Class name cannot be empty');
    }
    this.id = data.id || `cls-${Math.random().toString(36).substring(2, 9)}`;
    this.name = data.name.trim();
    this.stereotype = data.stereotype || 'Entity';
    this.responsibilities = data.responsibilities || '';
    this.attributes = data.attributes || [];
    this.methods = data.methods || [];
  }

  public isInterfaceOrAbstract(): boolean {
    return this.stereotype === 'Interface' || this.stereotype === 'AbstractClass';
  }

  public hasMethods(): boolean {
    return this.methods.length > 0;
  }

  public toSummaryText(): string {
    const attrs = this.attributes.map(a => `${a.visibility || 'public'} ${a.name}: ${a.type}`).join(', ');
    const meths = this.methods.map(m => `${m.visibility || 'public'} ${m.name}(${m.parameters || ''}): ${m.returnType}`).join(', ');
    return `[${this.stereotype}] ${this.name} | Responsibilities: ${this.responsibilities} | Attrs: [${attrs}] | Methods: [${meths}]`;
  }
}
