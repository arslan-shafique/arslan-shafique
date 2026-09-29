import { portfolioKnowledge } from "./portfolio-knowledge.js";

const stopWords = new Set([
  "a", "about", "an", "and", "are", "as", "at", "be", "can", "did", "do", "does",
  "for", "from", "has", "have", "he", "his", "how", "i", "in", "is", "it", "me",
  "of", "on", "or", "tell", "that", "the", "their", "this", "to", "was", "what",
  "when", "where", "which", "who", "why", "with", "you",
]);

const aliases = new Map([
  ["cv", ["resume"]],
  ["resume", ["cv"]],
  ["job", ["experience", "work"]],
  ["employment", ["experience", "work"]],
  ["technology", ["skills", "stack"]],
  ["technologies", ["skills", "stack"]],
  ["project", ["projects"]],
  ["certificate", ["certification", "credential"]],
  ["certificates", ["certification", "credential"]],
]);

export function tokenize(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .match(/[a-z0-9]+(?:-[a-z0-9]+)*/g)
    ?.filter((token) => token.length > 1 && !stopWords.has(token)) || [];
}

function expandedQueryTokens(query) {
  const tokens = tokenize(query);
  return [...new Set(tokens.flatMap((token) => [token, ...(aliases.get(token) || [])]))];
}

function countOccurrences(tokens, wanted) {
  return tokens.reduce((count, token) => count + Number(token === wanted), 0);
}

function scoreChunk(chunk, query, queryTokens) {
  const titleTokens = tokenize(chunk.title);
  const keywordTokens = tokenize(chunk.keywords.join(" "));
  const contentTokens = tokenize(chunk.content);
  let score = 0;

  for (const token of queryTokens) {
    if (titleTokens.includes(token)) score += 7;
    if (keywordTokens.includes(token)) score += 5;
    score += Math.min(countOccurrences(contentTokens, token), 3) * 1.5;
  }

  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length >= 4 && chunk.content.toLowerCase().includes(normalizedQuery)) {
    score += 10;
  }

  return score;
}

export function retrievePortfolioContext(query, limit = 4) {
  const queryTokens = expandedQueryTokens(query);

  if (!queryTokens.length) {
    return portfolioKnowledge.filter((chunk) => ["profile-overview", "contact-resume"].includes(chunk.id));
  }

  const matches = portfolioKnowledge
    .map((chunk) => ({ ...chunk, score: scoreChunk(chunk, query, queryTokens) }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, Math.max(1, Math.min(limit, 6)));

  if (matches.length) return matches;

  return portfolioKnowledge.filter((chunk) => ["profile-overview", "contact-resume"].includes(chunk.id));
}

export function formatRetrievedContext(chunks) {
  return chunks
    .map((chunk, index) => `[${index + 1}] ${chunk.title} (${chunk.section})\n${chunk.content}`)
    .join("\n\n");
}
