export const makeOpenJSONPrefix = (levels: number): string => {
  if (levels <= 0) return "";
  const inner = JSON.stringify({
    number: 5,
    string: "string",
    escaped: "\\",
    colon: ":",
    "comma: ": ",",
    arr: [1, "two", true, false, null],
  }).slice(1, -1); // strip outer { }
  return "{" + inner + (',"next":{' + inner).repeat(levels - 1);
};
