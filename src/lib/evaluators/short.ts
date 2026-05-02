// src/lib/evaluators/short.ts
// M4 T06 — short evaluation: exact, fuzzy (Levenshtein), numeric/Big-O.

interface ShortAnswerSchema {
  match: 'exact' | 'fuzzy' | 'numeric';
  expected: string;
  tol?: number;
}

interface ShortResponse {
  text: string;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1]
        ? prev
        : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
}

// Strips spaces inside O(...) and lowercases. "O( n log n )" → "O(nlogn)".
function normalizeAsymptotic(s: string): string {
  return s.replace(/O\([^)]*\)/g, (m) => 'O(' + m.slice(2, -1).replace(/\s+/g, '').toLowerCase() + ')').toLowerCase().trim();
}

export function evaluateShort(
  answerSchema: ShortAnswerSchema,
  response: ShortResponse,
): 'pass' | 'fail' {
  const { match, expected, tol } = answerSchema;
  const raw = response.text;

  if (match === 'exact') {
    return raw.trim().toLowerCase() === expected.trim().toLowerCase() ? 'pass' : 'fail';
  }

  if (match === 'fuzzy') {
    const threshold = tol ?? 2;
    const dist = levenshtein(raw.trim().toLowerCase(), expected.trim().toLowerCase());
    return dist <= threshold ? 'pass' : 'fail';
  }

  // numeric
  const normRaw = normalizeAsymptotic(raw);
  const normExp = normalizeAsymptotic(expected);

  // Big-O path: both contain O( after normalization
  if (normRaw.includes('o(') && normExp.includes('o(')) {
    return normRaw === normExp ? 'pass' : 'fail';
  }

  // Numeric path
  const parsedRaw = parseFloat(raw.trim());
  const parsedExp = parseFloat(expected.trim());
  if (!isNaN(parsedRaw) && !isNaN(parsedExp)) {
    return Math.abs(parsedRaw - parsedExp) <= (tol ?? 0) ? 'pass' : 'fail';
  }

  return 'fail';
}
