export const tryParseJsonString = (value: any): Record<string, any> | null => {
  try {
    return JSON.parse(value);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return value;
  }
};
