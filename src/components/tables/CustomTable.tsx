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
        "bg-base-100 shadow-md ring ring-current/20 " +
        (ring ? " rounded-box " : "rounded-b-box")
      }
    >
      <div className="relative overflow-x-auto">
        <table className="table w-full text-md">
          <thead>
            <tr className="rounded-2xl bg-base-200/50">
              {props.columns &&
                props.columns.map((column, idx) => (
                  <th
                    key={idx}
                    className="capitalize text-left text-md font-semibold text-base-content/70"
                  >
                    {column.label}
                  </th>
                ))}
              {!props.columns?.find((item) => item.key === "action") &&
                props.actions &&
                props.actions.length > 0 && (
                  <th className="font-semibold text-md text-base-content/70">
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
                    className={`hover:bg-base-300 border-base-300 ${onRowClick ? "cursor-pointer" : ""}`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {props.columns?.map((col, colIdx) => (
                      <td
                        className="py-3 px-4 text-ellipsis overflow-hidden max-w-xs text-base-content"
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
                        <td onClick={(e) => e.stopPropagation()}>
                          <PopUp
                            itemIndex={rowIdx}
                            setIndex={setSelectedItem}
                            currentIndex={selectedItem}
                            key={rowIdx + "menu"}
                            actions={props?.actions || []}
                            item={item}
                          />
                        </td>
                      )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={colSpan || 1}
                  className="py-8 text-center text-sm text-base-content/60"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 bg-base-200/30 border-t border-base-300">
          <div className="text-sm text-base-content/60">
            Showing <span className="font-medium">{startRange}</span> to{" "}
            <span className="font-medium">{endRange}</span> of{" "}
            <span className="font-medium">{totalCount}</span> results
            {totalCount > 0 && (
              <span className="ml-1 text-xs text-base-content/40">
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
