export function commonKeys<A extends {}, B extends {}>(a: A, b: B) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  return aKeys.filter((key) => bKeys.includes(key));
}
export default commonKeys;