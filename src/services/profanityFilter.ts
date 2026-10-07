/**
 * Basic profanity and spam filter for sports community submissions
 */

const BLOCKED_WORDS = [
  'scam',
  'fixed match',
  '100% sure banker dm',
  'dm me for fixed',
  'whatsapp me for sure win',
  'crypto investment',
  'ponzi',
  'fuck',
  'bitch',
  'asshole',
  'bastard',
  'idiot',
  'fool',
  'mumu',
  'ode',
  'scammer',
];

export function cleanText(input: string): string {
  if (!input) return '';
  let cleaned = input;
  for (const word of BLOCKED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '*'.repeat(word.length));
  }
  return cleaned;
}

export function containsProfanityOrSpam(input: string): { isFlagged: boolean; reason?: string } {
  if (!input) return { isFlagged: false };
  const lower = input.toLowerCase();

  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) {
      return {
        isFlagged: true,
        reason: `Comment contains prohibited term or scam solicitation ("${word}")`
      };
    }
  }

  // Check for suspicious external phone numbers or spam solicitations
  const phonePattern = /(\+?234|0)[789][01]\d{8}/;
  if (phonePattern.test(input) && (lower.includes('dm') || lower.includes('chat') || lower.includes('fixed'))) {
    return {
      isFlagged: true,
      reason: 'Sharing phone numbers for fixed-match solicitations is strictly prohibited.'
    };
  }

  return { isFlagged: false };
}
