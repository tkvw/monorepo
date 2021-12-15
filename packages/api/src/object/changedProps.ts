import commonKeys from './commonKeys';
export function changedProps<Current extends Record<string, unknown>, Next extends Record<string, unknown>>(
  current: Current,
  next: Next
) {
  const keys = commonKeys(current, next);
  return keys.reduce((acc, key) => {
    if (current[key] !== next[key]) {
      acc[key] = next[key];
    }
    return acc;
  }, {} as Record<string, unknown>);
}

export default changedProps;
