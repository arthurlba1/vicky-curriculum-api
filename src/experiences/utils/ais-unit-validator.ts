import { GeneratedAisUnitDto } from '../dto/generate-ais-units.response';

/**
 * Validator for AIS Units
 * Ensures data integrity and completeness before emission
 */
export class AisUnitValidator {
  /**
   * Validate a single AIS unit
   * Returns null if invalid, otherwise returns sanitized unit
   */
  static validate(unit: unknown): GeneratedAisUnitDto | null {
    if (!unit || typeof unit !== 'object') {
      return null;
    }

    const candidate = unit as Record<string, unknown>;

    // Validate required string fields
    if (
      !this.isValidString(candidate.action) ||
      !this.isValidString(candidate.impact) ||
      !this.isValidString(candidate.context)
    ) {
      return null;
    }

    // Validate and sanitize skills array
    const skills = this.validateSkills(candidate.skills);

    return {
      action: candidate.action.trim(),
      impact: candidate.impact.trim(),
      context: candidate.context.trim(),
      skills,
    };
  }

  /**
   * Validate and sanitize multiple AIS units
   * Returns only valid units
   */
  static validateBatch(units: unknown[]): GeneratedAisUnitDto[] {
    return units
      .map((unit) => this.validate(unit))
      .filter((unit): unit is GeneratedAisUnitDto => unit !== null);
  }

  /**
   * Check if a value is a valid non-empty string
   */
  private static isValidString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * Validate and sanitize skills array
   */
  private static validateSkills(skills: unknown): string[] {
    if (!Array.isArray(skills)) {
      return [];
    }

    return skills
      .filter((skill): skill is string => typeof skill === 'string' && skill.trim().length > 0)
      .map((skill) => skill.trim());
  }
}
