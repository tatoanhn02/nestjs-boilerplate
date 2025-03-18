export const tryParseJsonString = (value: any) => {
  try {
    return JSON.parse(value);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return value;
  }
};

export const escapeRegex = (value: string): string => {
  return value.replace(/[-[\]{}()*+?.,\\/^$|#\s]/g, '\\$&');
};
