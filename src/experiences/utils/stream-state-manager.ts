import { GeneratedAisUnitDto } from '../dto/generate-ais-units.response';
import { createHash } from 'crypto';

/**
 * Manages state during streaming to prevent duplicate emissions
 * Uses content-based hashing to track which units have been emitted
 * 
 * This is necessary because the incremental parser may detect the same
 * complete object multiple times as more content arrives, and we need
 * to ensure each unique unit is only emitted once.
 */
export class StreamStateManager {
  private emittedUnitHashes: Set<string> = new Set();
  private emittedCount: number = 0;

  /**
   * Get only new units that haven't been emitted yet
   * Uses content-based hashing to detect duplicates
   * 
   * @param units - Array of units from parser
   * @returns Only units that haven't been emitted yet
   */
  getNewUnits(units: GeneratedAisUnitDto[]): GeneratedAisUnitDto[] {
    if (units.length === 0) {
      return [];
    }

    const newUnits: GeneratedAisUnitDto[] = [];

    for (const unit of units) {
      const hash = this.createUnitHash(unit);
      
      if (!this.emittedUnitHashes.has(hash)) {
        this.emittedUnitHashes.add(hash);
        newUnits.push(unit);
        this.emittedCount++;
      }
    }

    return newUnits;
  }

  /**
   * Create a hash for a unit based on its content
   * Used to detect duplicates even if the same object appears multiple times
   */
  private createUnitHash(unit: GeneratedAisUnitDto): string {
    // Create a stable hash based on the unit's content
    // Using action + impact as the primary identifier
    const content = `${unit.action}|${unit.impact}|${unit.context}`;
    return createHash('md5').update(content).digest('hex');
  }

  /**
   * Get count of emitted units
   */
  getEmittedCount(): number {
    return this.emittedCount;
  }

  /**
   * Reset state (useful for testing or reconnection)
   */
  reset(): void {
    this.emittedUnitHashes.clear();
    this.emittedCount = 0;
  }
}
