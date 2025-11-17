import { ValueTransformer } from 'typeorm';

/**
 * Transformer for pgvector type in TypeORM
 * Converts between TypeORM representation and pgvector array representation
 */
export class VectorTransformer implements ValueTransformer {
  /**
   * Transform value from database to TypeORM
   * pgvector stores as array of numbers
   */
  to(value: number[] | null): number[] | null {
    if (!value) return null;
    return value;
  }

  /**
   * Transform value from TypeORM to database
   * pgvector expects array format
   */
  from(value: string | number[] | null): number[] | null {
    if (!value) return null;
    if (Array.isArray(value)) return value;
    // Handle string representation (e.g., from PostgreSQL array literal)
    if (typeof value === 'string') {
      try {
        // Remove brackets and parse comma-separated values
        const cleaned = value.replace(/[{}]/g, '');
        return cleaned ? cleaned.split(',').map(Number.parseFloat) : [];
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
