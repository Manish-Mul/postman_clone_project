export function replaceVariables(text, variables = []) {
  if (!text || typeof text !== 'string') return text;
  if (!Array.isArray(variables)) return text;

  let result = text;

  variables.forEach(({ key, value }) => {
    // String-based, trimmed and case-sensitive replacement
    if (typeof key === 'string') {
      const trimmedKey = key.trim();
      const trimmedValue = typeof value === 'string' ? value.trim() : value ?? '';
      const regex = new RegExp(`{{\\s*${trimmedKey}\\s*}}`, 'g');
      result = result.replace(regex, trimmedValue);
    }
  });

  // Warn for unresolved placeholders 
  result = result.replace(/{{\s*[\w-]+\s*}}/g, (match) => match);

  // Decode encoded braces
  result = result.replace(/%7B%7B/g, '{{').replace(/%7D%7D/g, '}}');

  return result;
}
