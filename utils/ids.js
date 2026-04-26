// Collision-resistant ID generator for locally-stored records.

/** Generate a unique string ID based on timestamp + random suffix. */
export const generateId = () =>
  Date.now().toString() + Math.random().toString(36).slice(2, 7);
