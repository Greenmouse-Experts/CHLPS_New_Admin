import { useState } from "react";
import PopUp, { type Actions } from "./pop-up";
import { usePagination } from "@/helpers/pagination";
import SimplePaginator from "@/components/SimplePaginator";

export type columnType<T = any> = {
  key: string;
  label: string;
  render?: (value: any, item: T) => any;
};

interface CustomTableProps {
  data?: any[];
  columns?: columnType[];
  actions?: Actions[];
  user?: any;
  ring?: boolean;
  totalCount?: number;
  paginationProps?: ReturnType<typeof usePagination>;
  onRowClick?: (item: any) => void;
  color?: "primary" | "secondary" | "acccent";
}

export default function CustomTable(props: CustomTableProps) {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const { onRowClick } = props;
  const pagination = props?.paginationProps;
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 10;
  const { ring = true, totalCount = props.data?.length || 0 } = props;

  const startRange = totalCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRange = Math.min(page * pageSize, totalCount);
  const totalPages =
    totalCount > 0 ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1;

  const colSpan =
    (props.columns?.length || 0) +
    (!props.columns?.find((item) => item.key === "action") &&
    props.actions &&
    props.actions.length > 0
      ? 1
      : 0);

  return (
    <div
      className={
        "bg-white border border-[#E7E9EB] shadow-xs " +
        (ring ? " rounded-xl " : "rounded-b-xl")
      }
    >
      <div className="relative overflow-x-auto">
        <table className="table w-full text-sm">
          <thead>
            <tr className="border-b border-[#E7E9EB] bg-[#FAFAFA]">
              {props.columns &&
                props.columns.map((column, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left text-xs font-semibold text-[#717171] uppercase tracking-wider whitespace-nowrap"
                  >
                    {column.label}
                  </th>
                ))}
              {!props.columns?.find((item) => item.key === "action") &&
                props.actions &&
                props.actions.length > 0 && (
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#717171] uppercase tracking-wider whitespace-nowrap">
                    Action
                  </th>
                )}
            </tr>
          </thead>
          <tbody>
            {props.data && props.data.length > 0 ? (
              props.data.map((item, rowIdx) => {
                return (
                  <tr
                    key={rowIdx}
                    className={`border-b border-[#E7E9EB]/60 last:border-0 hover:bg-[#F7F7F7] transition-colors ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {props.columns?.map((col, colIdx) => (
                      <td
                        className="py-3 px-4 text-sm text-[#1F1F1F]"
                        key={colIdx}
                      >
                        {col.render
                          ? col.render(item[col.key], item)
                          : item[col.key]}
                      </td>
                    ))}
                    {!props.columns?.find((item) => item.key === "action") &&
                      props.actions &&
                      props.actions.length > 0 && (
                        <td
                          className="py-3 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-end">
                            <PopUp
                              itemIndex={rowIdx}
                              setIndex={setSelectedItem}
                              currentIndex={selectedItem}
                              key={rowIdx + "menu"}
                              actions={props?.actions || []}
                              item={item}
                            />
                          </div>
                        </td>
                      )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={colSpan || 1}
                  className="py-12 text-center text-sm text-[#717171]"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-[#E7E9EB]">
          <div className="text-xs text-[#717171]">
            Showing{" "}
            <span className="font-medium text-[#1F1F1F]">{startRange}</span> to{" "}
            <span className="font-medium text-[#1F1F1F]">{endRange}</span> of{" "}
            <span className="font-medium text-[#1F1F1F]">{totalCount}</span>{" "}
            results
            {totalCount > 0 && (
              <span className="ml-1 text-xs text-[#ADADAD]">
                ({totalPages} {totalPages === 1 ? "page" : "pages"})
              </span>
            )}
          </div>
          <SimplePaginator
            page={page}
            setPage={(newPage) => pagination.setPagination(newPage)}
            incrementPage={() => pagination.setPagination(page + 1)}
            decrementPage={() =>
              pagination.setPagination(Math.max(1, page - 1))
            }
            hasMore={endRange < totalCount}
          />
        </div>
      )}
    </div>
  );
}
