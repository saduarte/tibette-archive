import type { Fic } from "./data";

export type AuthorAggregate = {
  name: string;
  totalFics: number;
  totalVotes: number;
  authorScore: number | null; 
  topFicByVotes: Fic | null;
};

export function groupByAuthor(fics: Fic[]) {
  const map = new Map<string, Fic[]>();
  for (const fic of fics) {
    const key = fic.author;
    const current = map.get(key) ?? [];
    current.push(fic);
    map.set(key, current);
  }
  return map;
}

export function getAuthorAggregate(fics: Fic[], author: string): AuthorAggregate {
  const authorFics = fics.filter((f) => f.author === author);

  const totalFics = authorFics.length;
  const totalVotes = authorFics.reduce((acc, f) => acc + (f.votes || 0), 0);

  const weightedSum = authorFics.reduce(
    (acc, f) => acc + (f.ratingAvg || 0) * (f.votes || 0),
    0
  );

  const authorScore = totalVotes > 0 ? weightedSum / totalVotes : null;

  const topFicByVotes =
    authorFics.slice().sort((a, b) => (b.votes || 0) - (a.votes || 0))[0] ?? null;

  return { name: author, totalFics, totalVotes, authorScore, topFicByVotes };
}

export function getAllAuthorAggregates(fics: Fic[]): AuthorAggregate[] {
  const by = groupByAuthor(fics);
  const list: AuthorAggregate[] = [];

  for (const [author, authorFics] of by.entries()) {
    list.push(getAuthorAggregate(authorFics, author));
  }

  return list;
}


export function getTopAuthorsByScore(
  fics: Fic[],
  options?: { minVotes?: number; limit?: number }
): AuthorAggregate[] {
 
  const minVotes = options?.minVotes ?? 0; 
  const limit = options?.limit ?? 5;

  return getAllAuthorAggregates(fics)
    .filter((a) => a.totalVotes >= minVotes && a.authorScore !== null)
    .sort((a, b) => {
     
      if (b.authorScore !== a.authorScore) {
        return b.authorScore! - a.authorScore!;
      }

      // 2. DESEMPATE: Por Ano (Quem tem a obra mais recente de 2024 vence)
      const yearA = a.topFicByVotes?.year ?? 0;
      const yearB = b.topFicByVotes?.year ?? 0;
      if (yearB !== yearA) {
        return yearB - yearA;
      }

      // 3. DESEMPATE FINAL: Por Votos (Quem tem mais votos totais)
      return b.totalVotes - a.totalVotes;
    })
    .slice(0, limit);
}