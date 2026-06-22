export const VOCAB = [
  "<pad>", "<unk>",
  "added", "to", "cart", "remove", "removed",
  "viewed", "details", "product", "page", "site", "website",
  "sizing", "inquiries", "inquiry", "size", "fit",
  "restock", "requests", "request", "notification",
  "wishlist", "saves", "save", "saved",
  "urgency", "markers", "marker", "high", "medium", "low",
  "facebook", "instagram", "tiktok", "twitter", "x", "linkedin",
  "clicked", "link", "sent", "message", "commented", "comment",
  "purchase", "checkout", "buy"
];

const vocabMap: Record<string, number> = {};
VOCAB.forEach((word, index) => {
  vocabMap[word] = index;
});

const SEQ_LEN = 32;

export function tokenize(text: string): number[] {
  if (!text) {
    return new Array(SEQ_LEN).fill(0);
  }

  const tokens = text
    .toLowerCase()
    .replace(/[;,.\-_()#@!?]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0);

  const ids: number[] = [];
  for (const token of tokens) {
    if (token in vocabMap) {
      ids.push(vocabMap[token]);
    } else {
      ids.push(vocabMap["<unk>"]);
    }
  }

  if (ids.length < SEQ_LEN) {
    const padCount = SEQ_LEN - ids.length;
    return ids.concat(new Array(padCount).fill(vocabMap["<pad>"]));
  } else {
    return ids.slice(0, SEQ_LEN);
  }
}
