import type { QueryClient, QueryKey } from "@tanstack/react-query";

export type OptimisticListContext<T> = {
  previous: T[] | undefined;
};

/** Apply a synchronous cache update before a mutation reaches the server. */
export async function updateListOptimistically<T>(
  client: QueryClient,
  queryKey: QueryKey,
  update: (current: T[]) => T[],
): Promise<OptimisticListContext<T>> {
  await client.cancelQueries({ queryKey });
  const previous = client.getQueryData<T[]>(queryKey);
  if (previous) client.setQueryData<T[]>(queryKey, update(previous));
  return { previous };
}

/** Restore the exact list snapshot when the server rejects an optimistic mutation. */
export function rollbackOptimisticList<T>(
  client: QueryClient,
  queryKey: QueryKey,
  context?: OptimisticListContext<T>,
): void {
  if (context?.previous) client.setQueryData<T[]>(queryKey, context.previous);
}
