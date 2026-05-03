export function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => snakeToCamel(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      // Transformation de la clé : ma_question -> maQuestion
      const camelKey = key.replace(/(_\w)/g, (match) => match[1].toUpperCase());
      result[camelKey] = snakeToCamel(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}
