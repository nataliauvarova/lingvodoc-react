export function compositeIdToString(id) {
  if (!id) return null;
  return `${id[0]},${id[1]}`;
}

export function stringToCompositeId(str) {
  return str.split(",").map(Number);
}
