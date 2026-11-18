import type { TFunction } from 'i18next';

/**
 * Translates dynamic subject names (including compound strings like "Mathematics: Algebra")
 * using common:subjects.<key> with clean English fallback.
 */
export function translateSubjectLabel(subjectName: string, t: TFunction): string {
  if (!subjectName) return '';
  const trimmed = subjectName.trim();
  const direct = t(`common:subjects.${trimmed}`, { defaultValue: '' });
  if (direct) return direct;

  // Handle patterns like "Grade 10 Physics" or "Physics: Mechanics"
  if (trimmed.includes(':')) {
    const [prefix, ...rest] = trimmed.split(':');
    const translatedPrefix = t(`common:subjects.${prefix.trim()}`, { defaultValue: '' });
    if (translatedPrefix) {
      return `${translatedPrefix}: ${rest.join(':').trim()}`;
    }
  }

  return trimmed;
}

export function translateBoardLabel(boardId: string, t: TFunction, fallbackLabel?: string): string {
  if (!boardId) return fallbackLabel || '';
  const translated = t(`common:boards.${boardId}`, { defaultValue: '' });
  return translated || fallbackLabel || boardId;
}

export function translateCategoryLabel(category: string, t: TFunction): string {
  if (!category) return '';
  const translated = t(`common:categories.${category}`, { defaultValue: '' });
  return translated || category;
}

export function translateStatusLabel(status: string, t: TFunction): string {
  if (!status) return '';
  const translated = t(`common:statuses.${status}`, { defaultValue: '' });
  return translated || status;
}
