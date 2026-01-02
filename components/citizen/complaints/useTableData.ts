import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function useTableData<T>(
  fetchFunction: (params: any) => Promise<{ data: T[]; total: number }>,
  initialParams: any,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await fetchFunction(initialParams);
      setData(result.data);
      setTotal(result.total);
    } catch (e) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, JSON.stringify(initialParams)]);

  useEffect(() => {
    refresh();
  }, [...dependencies, refresh]);

  return { data, total, loading, refresh, setData };
}