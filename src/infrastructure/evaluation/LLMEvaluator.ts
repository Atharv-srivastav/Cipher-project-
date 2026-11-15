import { IEvaluationStrategy } from '../../domain/strategies/IEvaluationStrategy.ts';
import { Submission } from '../../domain/entities/Submission.ts';
import { Problem } from '../../domain/entities/Problem.ts';
import { Evaluation } from '../../domain/entities/Evaluation.ts';
import { FeedbackItemData } from '../../domain/value-objects/FeedbackCriterion.ts';

export class LLMEvaluator implements IEvaluationStrategy {
  public readonly id = 'llm-evaluator';
  public readonly name = 'Google Gemini LLM Evaluator';

  public async evaluate(attemptId: string, submission: Submission, problem: Problem): Promise<Evaluation> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0 || apiKey.includes('your_gemini_api_key_here')) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const prompt = `
You are a Senior Principal Software Architect and Low-Level Design (LLD) Interviewer evaluating a candidate's LLD attempt for the problem: "${problem.title}".

PROBLEM DESCRIPTION:
${problem.shortDescription}

REQUIREMENTS:
${problem.requirements.map(r => `- ${r}`).join('\n')}

EXPECTED DOMAIN ENTITIES:
${problem.expectedEntities.join(', ')}

CANDIDATE SUBMISSION:
<candidate_submission>
${submission.toNormalizedText()}
</candidate_submission>

EVALUATION INSTRUCTIONS:
Evaluate the candidate's design objectively based on Object-Oriented Analysis & Design (OOAD) best practices.
Analyze:
1. Class responsibilities & cohesion (Single Responsibility Principle)
2. Abstraction quality & interface usage (Open-Closed, Interface Segregation, Dependency Inversion)
3. Class relationships & coupling (Composition over Inheritance)
4. Design patterns appropriateness (Strategy, Factory, State, Observer, etc.)
5. Extensibility for future change scenarios

You MUST respond strictly with a valid JSON object matching the following JSON Schema:
{
  "overallScore": number (0-100),
  "summary": "2-3 sentence overview of the design strength and major feedback",
  "criteria": {
    "responsibilities": number (0-10),
    "abstraction": number (0-10),
    "coupling": number (0-10),
    "solid": number (0-10),
    "designPatterns": number (0-10),
    "extensibility": number (0-10)
  },
  "feedbackItems": [
    {
      "category": "STRENGTH" | "WEAKNESS" | "SOLID_OBSERVATION" | "PATTERN_SUGGESTION" | "EXTENSIBILITY_HINT",
      "title": "Short descriptive title",
      "description": "Detailed explainable feedback explaining WHY",
      "evidence": "Direct quote or class name reference from candidate submission"
    }
  ]
}

DO NOT include any markdown code fence wrappers or extra text outside the JSON object.
    `.trim();

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API request failed [${response.status}]: ${errText}`);
    }

    const payload = await response.json();
    const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Empty response from Gemini LLM API');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      // Clean potential JSON markdown fence
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    return new Evaluation({
      attemptId,
      overallScore: parsed.overallScore || 75,
      evaluatorMode: 'HYBRID_AI',
      summary: parsed.summary || 'AI evaluation completed successfully.',
      criteria: parsed.criteria || {
        responsibilities: 7,
        abstraction: 7,
        coupling: 7,
        solid: 7,
        designPatterns: 7,
        extensibility: 7,
      },
      feedbackItems: (parsed.feedbackItems || []).map((item: any) => ({
        category: item.category || 'STRENGTH',
        title: item.title || 'Design Observation',
        description: item.description || '',
        evidence: item.evidence || '',
      })),
    });
  }
}
