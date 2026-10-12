import { SEED_RUNBOOKS } from "../constants/runbooks.js";
import { KnowledgeDoc } from "../types/protocol.js";

export class VectorRAGEngine {
  private documents: KnowledgeDoc[];

  constructor() {
    this.documents = SEED_RUNBOOKS;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((term) => term.length > 2);
  }

  private computeVector(tokens: string[], vocabulary: string[]): number[] {
    const frequencyMap = new Map<string, number>();
    tokens.forEach((t) => frequencyMap.set(t, (frequencyMap.get(t) || 0) + 1));

    return vocabulary.map((word) => frequencyMap.get(word) || 0);
  }

  private cosineSimilarity(v1: number[], v2: number[]): number {
    let dot = 0;
    let norm1 = 0;
    let norm2 = 0;
    for (let i = 0; i < v1.length; i++) {
      dot += v1[i] * v2[i];
      norm1 += v1[i] * v1[i];
      norm2 += v2[i] * v2[i];
    }
    if (norm1 === 0 || norm2 === 0) return 0;
    return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  public retrieveRunbook(queryText: string): { doc: KnowledgeDoc; confidence: number } {
    const queryTokens = this.tokenize(queryText);
    const vocabSet = new Set<string>(queryTokens);

    this.documents.forEach((doc) => {
      this.tokenize(`${doc.title} ${doc.content}`).forEach((t) => vocabSet.add(t));
    });

    const vocabulary = Array.from(vocabSet);
    const queryVector = this.computeVector(queryTokens, vocabulary);

    let topDoc = this.documents[0];
    let maxScore = -1;

    for (const doc of this.documents) {
      const docTokens = this.tokenize(`${doc.title} ${doc.content}`);
      const docVector = this.computeVector(docTokens, vocabulary);
      const score = this.cosineSimilarity(queryVector, docVector);

      if (score > maxScore) {
        maxScore = score;
        topDoc = doc;
      }
    }

    return {
      doc: topDoc,
      confidence: Math.round(maxScore * 100),
    };
  }

  public generateDiagnosis(errorSummary: string) {
    const match = this.retrieveRunbook(errorSummary);

    return {
      rootCause: `Detected issue matching pattern: ${match.doc.title}`,
      confidence: `${match.confidence}%`,
      recommendedAction: match.doc.content,
    };
  }
}