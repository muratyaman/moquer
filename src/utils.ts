export const dbKey = (kind: string, id: string) => `${kind}:${id}`;

export const dbKeySplit = (key: string) => {
  const [ kind, id ] = key.split(':');
  return { kind, id };
}
