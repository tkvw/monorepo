import commonKeys from './commonKeys.js';
export function changedProps<Current extends Record<string, any>, Next extends Record<string, any>>(
  current: Current,
  next: Next
) {
  const keys = commonKeys(current, next);
  return keys.reduce((acc, key) => {
    if (current[key] !== next[key]) {
      acc[key] = next[key];
    }
    return acc;
  }, {} as Record<string, any>);
}

export default changedProps;
