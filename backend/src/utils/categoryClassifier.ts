const categoryRules: Array<{ category: string; keywords: string[] }> = [
  { category: "Food", keywords: ["restaurant", "coffee", "cafe", "dinner", "lunch", "breakfast", "meal", "uber eats", "grubhub", "doordash", "starbucks"] },
  { category: "Groceries", keywords: ["supermarket", "grocery", "whole foods", "trader joe", "aldi", "kroger", "food lion", "costco", "walmart"] },
  { category: "Transportation", keywords: ["uber", "lyft", "taxi", "bus", "train", "metro", "transport", "flight", "airport", "fuel", "gas station", "shell", "bp"] },
  { category: "Entertainment", keywords: ["netflix", "spotify", "youtube", "movie", "cinema", "concert", "concert", "twitch", "hulu", "disney+"] },
  { category: "Utilities", keywords: ["electric", "water", "gas", "internet", "wifi", "cable", "utility", "phone bill", "comcast", "verizon", "att"] },
  { category: "Rent", keywords: ["rent", "landlord", "apartment", "lease"] },
  { category: "Salary", keywords: ["salary", "payroll", "paycheck", "direct deposit", "income"] },
  { category: "Health", keywords: ["clinic", "doctor", "pharmacy", "hospital", "medical", "dental", "optical"] },
  { category: "Shopping", keywords: ["amazon", "macy", "target", "shopping", "mall", "store", "walmart"] },
  { category: "Insurance", keywords: ["insurance", "premium", "geico", "state farm", "allstate", "metlife"] },
  { category: "Education", keywords: ["tuition", "school", "college", "university", "course", "udemy", "coursera"] },
  { category: "Travel", keywords: ["hotel", "airbnb", "booking", "travel", "flight", "holiday", "trip"] },
];

export const classifyTransaction = (
  category: string | undefined,
  description: string | undefined,
  paymentMethod: string | undefined
): { category: string; autoCategorized: boolean; confidence: number } => {
  const normalizedCategory = category?.trim()?.toLowerCase();
  const normalizedDescription = (description || "").toLowerCase();
  const normalizedPayment = (paymentMethod || "").toLowerCase();
  const text = `${normalizedDescription} ${normalizedPayment}`;

  if (normalizedCategory && normalizedCategory !== "" && normalizedCategory !== "other" && normalizedCategory !== "uncategorized") {
    return { category: category!.trim(), autoCategorized: false, confidence: 1.0 };
  }

  for (const rule of categoryRules) {
    const found = rule.keywords.some((keyword) => text.includes(keyword));
    if (found) {
      return { category: rule.category, autoCategorized: true, confidence: 0.9 };
    }
  }

  return {
    category: category?.trim() || "Other",
    autoCategorized: true,
    confidence: 0.5,
  };
};
