/**
 * Extracts a context snippet around a search match
 * @param text The full text to extract context from
 * @param searchTerm The search term to find
 * @param contextLength The number of characters to include before and after the match
 * @returns An object with the field name and context snippet
 */
export function extractMatchContext(
  text: string,
  searchTerm: string,
  contextLength: number = 15
): string {
  if (!text || !searchTerm) return '';
  
  const lowerText = text.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerSearchTerm);
  
  if (matchIndex === -1) return '';
  
  // Calculate start and end indices for the context
  const startIndex = Math.max(0, matchIndex - contextLength);
  const endIndex = Math.min(text.length, matchIndex + searchTerm.length + contextLength);
  
  // Extract the context
  let context = text.substring(startIndex, endIndex);
  
  // Add ellipsis if we're not at the beginning or end of the text
  if (startIndex > 0) context = '...' + context;
  if (endIndex < text.length) context = context + '...';
  
  return context;
}

/**
 * Creates a match info object with field name and context
 * @param fieldName The name of the field where the match was found
 * @param text The text containing the match
 * @param searchTerm The search term
 * @returns An object with field name and context
 */
export function createMatchInfo(
  fieldName: string,
  text: string,
  searchTerm: string
): { field: string; context: string } {
  return {
    field: fieldName,
    context: extractMatchContext(text, searchTerm)
  };
}
