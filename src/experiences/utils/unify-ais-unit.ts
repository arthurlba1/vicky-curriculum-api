/**
 * Utility function to unify an AIS Unit into a single text string for embedding generation.
 * This function is domain-agnostic and can be used independently of embedding services.
 * 
 * @param aisUnit - AIS Unit object with action, impact, context, and optional skills
 * @returns Unified text representation suitable for embedding generation
 * 
 * @example
 * ```typescript
 * const text = unifyAisUnitToText({
 *   action: "Led team of 5 developers",
 *   impact: "Reduced deployment time by 60%",
 *   context: "Microservices architecture using Node.js",
 *   skills: ["Node.js", "Docker", "Kubernetes"]
 * });
 * // Returns: "Action: Led team of 5 developers. Context: Microservices architecture using Node.js. Impact: Reduced deployment time by 60%. Skills: Node.js, Docker, Kubernetes"
 * ```
 */
export function unifyAisUnitToText(aisUnit: {
  action: string;
  impact: string;
  context: string;
  skills?: string[];
}): string {
  const parts: string[] = [];

  if (aisUnit.action) {
    parts.push(`Action: ${aisUnit.action}`);
  }

  if (aisUnit.context) {
    parts.push(`Context: ${aisUnit.context}`);
  }

  if (aisUnit.impact) {
    parts.push(`Impact: ${aisUnit.impact}`);
  }

  if (aisUnit.skills && aisUnit.skills.length > 0) {
    parts.push(`Skills: ${aisUnit.skills.join(', ')}`);
  }

  return parts.join('. ');
}
