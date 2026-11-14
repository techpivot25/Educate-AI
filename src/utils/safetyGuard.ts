export interface FoulLanguageCheckResult {
  isFoul: boolean;
  reason?: string;
}

const FOUL_PATTERNS: RegExp[] = [
  /\bf+[\W_]*u+[\W_]*c+[\W_]*k+\w*/i,
  /\bs+[\W_]*h+[\W_]*[i1!]+[\W_]*t+\w*/i,
  /\bb+[\W_]*[i1!]+[\W_]*t+[\W_]*c+[\W_]*h+\w*/i,
  /\ba+[\W_]*s+[\W_]*s+[\W_]*h+[\W_]*o+[\W_]*l+[\W_]*e+\w*/i,
  /\bb+[\W_]*a+[\W_]*s+[\W_]*t+[\W_]*a+[\W_]*r+[\W_]*d+\w*/i,
  /\bm+[\W_]*o+[\W_]*t+[\W_]*h+[\W_]*e+[\W_]*r+[\W_]*f+\w*/i,
  /\bd+[\W_]*[i1!]+[\W_]*c+[\W_]*k+\w*/i,
  /\bp+[\W_]*u+[\W_]*s+[\W_]*s+[\W_]*y+\w*/i,
  /\bc+[\W_]*u+[\W_]*n+[\W_]*t+\w*/i,
  /\bw+[\W_]*h+[\W_]*o+[\W_]*r+[\W_]*e+\w*/i,
  /\bs+[\W_]*l+[\W_]*u+[\W_]*t+\w*/i,
  /\bbullshit\b/i,
  /\bdamn\b/i,
  /\bcrap\b/i,
  /\bwtf\b/i,
  /\bstfu\b/i,
  /\bidiot\w*\b/i,
  /\bmoron\w*\b/i,
  /\bretard\w*\b/i,
  /\bstupid\b/i,
  /\bkill\s+yourself\b/i,
  /\bkys\b/i,
  /\bgo\s+die\b/i,
  /\bsuck\s+(my|your)\b/i,
  /\bchutiya+\w*/i,
  /\bmadarchod+\w*/i,
  /\bb[eh]+nchod+\w*/i,
  /\bharami+\w*/i,
  /\bkamin[ae]+\w*/i,
  /\bbsdk\b/i,
  /\bbhosdike\b/i,
  /\bgandu+\w*/i,
  /\brandi+\w*/i,
  /\bsaal[ae]+\b/i,
  /\bbakwa+s\b/i,
];

function normalizeForProfanityCheck(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[*@$!_]/g, (ch) => {
      if (ch === '@') return 'a';
      if (ch === '$') return 's';
      if (ch === '!') return 'i';
      return '';
    });
}

export function detectFoulLanguage(text: string): FoulLanguageCheckResult {
  if (!text || !text.trim()) return { isFoul: false };
  const raw = text.trim();
  const normalized = normalizeForProfanityCheck(raw);

  const matched = FOUL_PATTERNS.some((pattern) => pattern.test(raw) || pattern.test(normalized));
  if (matched) {
    return {
      isFoul: true,
      reason: 'Abusive or foul language is strictly not permitted in Quick Doubts AI Assistant.',
    };
  }
  return { isFoul: false };
}

const DIRECT_MEDICAL_OR_DRUG_PATTERNS: RegExp[] = [
  /\b(medicine|medicines|medication|medications|tablet|tablets|pill|pills|capsule|capsules|syrup|painkiller|antidepressant|antidepressants|sedative|sedatives|tranquilizer|sleeping pill|sleeping pills|melatonin|ashwagandha|modafinil|adderall|ritalin|xanax|prozac|lexapro|paracetamol|ibuprofen|aspirin|dosage|dose|prescribe|prescription|medical support|medical help|medical advice|medical treatment|mental health treatment|therapist|psychiatrist|psychologist|counseling|counselling|helpline|remedy|remedies)\b/i,
];

const STRESS_KEYWORDS_PATTERN =
  /\b(stress|stressed|stressing|anxiety|anxious|depressed|depression|panic attack|panicking|burnout|overwhelmed|insomnia|sleepless|can't sleep|cannot sleep|headache|migraine|nervous breakdown|mental breakdown|crying|exhausted|suicidal|self[- ]harm|hurt myself)\b/i;

const PHYSICS_MECHANICS_CONTEXT =
  /\b(shear stress|tensile stress|compressive stress|normal stress|stress and strain|stress-strain|young'?s modulus|hooke'?s law|mechanical stress|thermal stress)\b/i;

export function detectStressOrMedicalQuery(text: string): boolean {
  if (!text || !text.trim()) return false;
  if (PHYSICS_MECHANICS_CONTEXT.test(text)) return false;

  if (DIRECT_MEDICAL_OR_DRUG_PATTERNS.some((p) => p.test(text))) {
    return true;
  }

  if (STRESS_KEYWORDS_PATTERN.test(text)) {
    return true;
  }

  return false;
}

export const STRICT_PARENT_DOCTOR_ONLY_RESPONSE =
  `I cannot suggest any medicines, remedies, or medical support for stress or health concerns.\n\nPlease speak openly with your **parents or guardians** and consult a qualified **medical practitioner** for proper guidance and care.`;

export interface ParsedDoubtResponse {
  resolution: string;
  furtherLearning: string;
  followUpSuggestions: string[];
}

export function parseQuickDoubtResponse(rawText: string): ParsedDoubtResponse {
  if (!rawText || !rawText.trim()) {
    return { resolution: '', furtherLearning: '', followUpSuggestions: [] };
  }

  const normalized = rawText.trim();
  const furtherMatch = normalized.match(/(?:^|\n)#{1,4}\s*Further\s+Learning\b[:\s]*/i);

  let resolutionPart = normalized;
  let furtherPart = '';

  if (furtherMatch && typeof furtherMatch.index === 'number') {
    resolutionPart = normalized.slice(0, furtherMatch.index).trim();
    furtherPart = normalized.slice(furtherMatch.index + furtherMatch[0].length).trim();
  }

  resolutionPart = resolutionPart.replace(/^#{1,4}\s*Resolution\b[:\s]*/i, '').trim();

  const suggestions: string[] = [];
  if (furtherPart) {
    const lines = furtherPart.split('\n');
    for (const line of lines) {
      const cleaned = line.trim().replace(/^[-*•\d.)]+\s*/, '').replace(/\*\*/g, '').trim();
      if (cleaned.length >= 10 && cleaned.length <= 140 && suggestions.length < 3) {
        suggestions.push(cleaned);
      }
    }
  }

  return {
    resolution: resolutionPart,
    furtherLearning: furtherPart,
    followUpSuggestions: suggestions,
  };
}
