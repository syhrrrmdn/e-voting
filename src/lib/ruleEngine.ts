/**
 * Rule engine: checks if user attributes satisfy the election rules
 */
export function checkEligibility(
  attributes: Record<string, string | number> = {},
  ruleGroup: any
): boolean {
  if (!ruleGroup) return true;
  
  const logic: 'AND' | 'OR' = ruleGroup.logic || 'AND';
  const conditions: any[] = ruleGroup.conditions || [];
  const groups: any[] = ruleGroup.groups || [];

  const conditionResults = conditions.map((cond: any) => {
    const userVal = attributes[cond.field];
    if (userVal === undefined || userVal === null) return false;

    switch (cond.operator) {
      case '=':
        return String(userVal) === String(cond.value);
      case '!=':
        return String(userVal) !== String(cond.value);
      case 'IN':
        if (Array.isArray(cond.value)) {
          return cond.value.map(String).includes(String(userVal));
        } else if (typeof cond.value === 'string') {
          return cond.value.split(',').map((s: string) => s.trim()).includes(String(userVal));
        }
        return false;
      default:
        return false;
    }
  });

  const groupResults = groups.map((g: any) => checkEligibility(attributes, g));
  const allResults = [...conditionResults, ...groupResults];

  if (allResults.length === 0) return true;

  return logic === 'AND'
    ? allResults.every(Boolean)
    : allResults.some(Boolean);
}

