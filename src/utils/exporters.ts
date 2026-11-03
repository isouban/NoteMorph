import { Deck, Flashcard } from '../types';

/**
 * Clean string for CSV/TSV export by escaping tabs and quotes
 */
function cleanForAnki(text: string): string {
  // Replace newlines with <br> for HTML rendering in Anki
  let html = text
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '<br>')
    .replace(/\t/g, '    ');
  return html;
}

/**
 * Exports cards to standard Anki TSV format (Tab-separated values)
 * with #separator:tab and #html:true headers for direct import.
 */
export function exportToAnkiTsv(cards: Flashcard[], deckName: string): void {
  const header = '#separator:tab\n#html:true\n#tags column:3\n';
  const rows = cards.map((card) => {
    const front = cleanForAnki(card.front);
    const back = cleanForAnki(card.back);
    // Anki expects tags separated by space, spaces in tags replaced with underscore
    const tags = (card.tags || [])
      .map((t) => t.trim().replace(/\s+/g, '_'))
      .join(' ');
    return `${front}\t${back}\t${tags}`;
  });

  const tsvContent = header + rows.join('\n');
  downloadBlob(tsvContent, `${slugify(deckName)}_anki.tsv`, 'text/tab-separated-values;charset=utf-8;');
}

/**
 * Exports cards as Markdown formatted flashcard notes or table
 */
export function generateMarkdownCards(cards: Flashcard[], deckTitle: string): string {
  let md = `# ${deckTitle} - Flashcard Deck\n\n`;
  md += `*Generated with SynapseCards · ${cards.length} Cards*\n\n---\n\n`;

  cards.forEach((card, idx) => {
    md += `### ${idx + 1}. ${card.front}\n\n`;
    md += `${card.back}\n\n`;
    md += `> **Topic:** ${card.topic} · **Difficulty:** ${card.difficulty} · **Tags:** ${card.tags.join(', ')}\n\n`;
    md += `---\n\n`;
  });

  return md;
}

export function generateMarkdownTable(cards: Flashcard[]): string {
  let md = `| # | Prompt (Front) | Answer (Back) | Topic | Difficulty | Tags |\n`;
  md += `|---|---|---|---|---|---|\n`;

  cards.forEach((card, idx) => {
    const cleanFront = card.front.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const cleanBack = card.back.replace(/\|/g, '\\|').replace(/\n/g, ' <br> ');
    const tags = card.tags.join(', ');
    md += `| ${idx + 1} | ${cleanFront} | ${cleanBack} | ${card.topic} | ${card.difficulty} | ${tags} |\n`;
  });

  return md;
}

/**
 * Exports full deck as JSON
 */
export function exportDeckToJson(deck: Deck): void {
  const jsonStr = JSON.stringify(deck, null, 2);
  downloadBlob(jsonStr, `${slugify(deck.title)}.json`, 'application/json;charset=utf-8;');
}

/**
 * Downloads a string as a file in the browser
 */
export function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(text: string): string {
  return (text || 'flashcards')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '') || 'deck';
}
