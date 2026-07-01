import React from "react";

export type Column<T> = {
  key: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey?: (row: T) => string | number;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  const getKey = (row: T, index: number): string => {
    if (rowKey) return String(rowKey(row));
    // Try common id fields
    const r = row as Record<string, unknown>;
    if (r.id !== undefined) return String(r.id);
    if (r.qr_id !== undefined) return String(r.qr_id);
    if (r.dept_id !== undefined) return String(r.dept_id);
    if (r.vendor_id !== undefined) return String(r.vendor_id);
    if (r.company_id !== undefined) return String(r.company_id);
    return String(index);
  };

  return (
    <div className="data-table-wrap">
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.key) + col.header}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "var(--muted-foreground)",
                    fontStyle: "italic",
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={getKey(row, idx)}>
                  {columns.map((col) => (
                    <td key={String(col.key) + col.header}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
