import { useState, type UIEvent } from 'react'
import type { ReactNode } from 'react'

const VIRTUAL_VIEWPORT_HEIGHT = 560
const VIRTUAL_ROW_HEIGHT = 48
const VIRTUAL_OVERSCAN = 5

export interface DataTableColumn<Row> {
  key: string
  header: ReactNode
  render: (row: Row) => ReactNode
  headerClassName?: string
  cellClassName?: string
}

interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[]
  rows: Row[]
  getRowKey: (row: Row) => string
  emptyState?: ReactNode
  tableClassName?: string
  virtualizeAfter?: number
}

function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  emptyState,
  tableClassName = 'w-full text-left text-sm',
  virtualizeAfter,
}: DataTableProps<Row>) {
  const [scrollPosition, setScrollPosition] = useState({
    top: 0,
    viewportHeight: VIRTUAL_VIEWPORT_HEIGHT,
  })
  const virtualized = virtualizeAfter !== undefined && rows.length > virtualizeAfter
  const firstVisibleRow = virtualized
    ? Math.max(0, Math.floor(scrollPosition.top / VIRTUAL_ROW_HEIGHT) - VIRTUAL_OVERSCAN)
    : 0
  const lastVisibleRow = virtualized
    ? Math.min(
        rows.length,
        Math.ceil(
          (scrollPosition.top + scrollPosition.viewportHeight) / VIRTUAL_ROW_HEIGHT,
        ) + VIRTUAL_OVERSCAN,
      )
    : rows.length
  const visibleRows = rows.slice(firstVisibleRow, lastVisibleRow)

  function updateScrollPosition(event: UIEvent<HTMLDivElement>) {
    setScrollPosition({
      top: event.currentTarget.scrollTop,
      viewportHeight: event.currentTarget.clientHeight,
    })
  }

  return (
    <div
      className={virtualized ? 'max-h-[560px] overflow-auto' : 'overflow-x-auto'}
      onScroll={virtualized ? updateScrollPosition : undefined}
    >
      <table className={tableClassName}>
        <thead
          className={`bg-slate-50 text-xs uppercase text-slate-500 ${
            virtualized ? 'sticky top-0 z-10' : ''
          }`}
        >
          <tr>
            {columns.map((column) => (
              <th
                className={column.headerClassName ?? 'px-5 py-3'}
                key={column.key}
                scope="col"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length ? (
            <>
              {firstVisibleRow > 0 && (
                <tr aria-hidden="true">
                  <td
                    colSpan={columns.length}
                    style={{ height: firstVisibleRow * VIRTUAL_ROW_HEIGHT }}
                  />
                </tr>
              )}
              {visibleRows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td
                    className={`${
                      column.cellClassName ?? 'px-5 py-4 text-slate-600'
                    } ${virtualized ? 'whitespace-nowrap' : ''}`}
                    style={virtualized ? { height: VIRTUAL_ROW_HEIGHT } : undefined}
                    key={column.key}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
              ))}
              {lastVisibleRow < rows.length && (
                <tr aria-hidden="true">
                  <td
                    colSpan={columns.length}
                    style={{
                      height: (rows.length - lastVisibleRow) * VIRTUAL_ROW_HEIGHT,
                    }}
                  />
                </tr>
              )}
            </>
          ) : emptyState ? (
            <tr>
              <td
                className="px-5 py-6 text-center text-sm text-slate-500"
                colSpan={columns.length}
              >
                {emptyState}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
