// Keep a delayed autosave from arriving after a newer explicit save.
export function createSaveQueue<T>(write: (value: T) => Promise<unknown>) {
  let tail: Promise<unknown> = Promise.resolve();
  return {
    enqueue(value: T) {
      const result = tail.then(() => write(value));
      tail = result.catch(() => undefined);
      return result;
    },
  };
}
