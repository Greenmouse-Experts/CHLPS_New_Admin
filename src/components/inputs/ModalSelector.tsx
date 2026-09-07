import { usePagination } from "@/helpers/pagination";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/api/simpleApi";
import apiClient from "@/api/simpleApi";

interface ModalSelectorProps {
  route: string;
  render: (data: any) => any;
  render_props?: {
    onchange: (item: any) => any;
  };
}

export default function ModalSelector(props: ModalSelectorProps) {
  const pages = usePagination();
  const query = useQuery({
    queryKey: ["modal-selector", props.route, pages.page],
    queryFn: async (): Promise<ApiResponse<any[]>> => {
      const resp = await apiClient.get(props.route);
      return resp.data as ApiResponse<any[]>;
    },
    enabled: !!props.route,
  });

  if (query.isLoading) return <div className="text-sm p-4">Loading...</div>;
  if (query.isError)
    return <div className="text-sm text-error p-4">Error loading data</div>;

  const list = query.data?.data || [];

  return (
    <div className="py-4 space-y-6 mt-3">
      <div className="rounded-md bg-base-300">
        <ul className="space-y-2 p-2">
          {list.map((item: any, idx: number) => (
            <li key={idx}>{props.render(item)}</li>
          ))}
          {list.length === 0 && (
            <li className="text-sm text-center py-4 text-base-content/60">
              No items available
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
