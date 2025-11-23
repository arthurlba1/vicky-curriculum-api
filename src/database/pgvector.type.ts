import { ValueTransformer } from 'typeorm';

/**
 * Transformer for pgvector type in TypeORM
 * Converts between TypeORM representation and pgvector array representation
 */
export class VectorTransformer implements ValueTransformer {
  /**
   * Transform value from TypeORM to database
   * Converts number[] to pgvector format string: [0.1,0.2,0.3]
   */
  to(value: number[] | null): string | null {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return null;
    }
    // Convert array to pgvector format: [0.1,0.2,0.3]
    return `[${value.join(',')}]`;
  }

  /**
   * Transform value from database to TypeORM
   * Converts pgvector string format to number[]
   */
  from(value: string | number[] | null): number[] | null {
    if (!value) return null;
    if (Array.isArray(value)) return value;
    // Handle string representation from PostgreSQL
    if (typeof value === 'string') {
      try {
        // Remove brackets and parse comma-separated values
        // Handles both [0.1,0.2] and {0.1,0.2} formats
        const cleaned = value.replace(/[{}[\]]/g, '');
        if (!cleaned) return null;
        return cleaned.split(',').map((v) => {
          const num = Number.parseFloat(v.trim());
          return Number.isNaN(num) ? 0 : num;
        });
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Creates a column type for pgvector
 * Use this as the type parameter in @Column decorator
 */
export const vector = (dimensions?: number): string => {
  return dimensions ? `vector(${dimensions})` : 'vector';
};
