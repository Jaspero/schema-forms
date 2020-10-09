export interface UniqueId {
  next: () => number
}

export function uniqueId(init = 0): UniqueId {
  return {
    next: () => ++init,
  };
}
