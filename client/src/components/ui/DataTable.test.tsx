import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from '@jest/globals'
import DataTable, { type DataTableColumn } from './DataTable'

interface Row {
  id: string
  name: string
}

const columns: DataTableColumn<Row>[] = [
  { key: 'name', header: 'Name', render: (row) => row.name },
]

describe('DataTable virtualization', () => {
  it('renders only nearby rows for a long list and updates them while scrolling', () => {
    const rows = Array.from({ length: 1_000 }, (_, index) => ({
      id: String(index),
      name: `Row ${index}`,
    }))
    const { container } = render(
      <DataTable
        columns={columns}
        getRowKey={(row) => row.id}
        rows={rows}
        virtualizeAfter={100}
      />,
    )
    const table = container.querySelector('table')
    if (!table) {
      throw new Error('Expected DataTable to render a table')
    }

    expect(within(table).getAllByRole('row').length).toBeLessThan(30)
    expect(screen.getByText('Row 0')).toBeTruthy()
    expect(screen.queryByText('Row 999')).toBeNull()

    const scroller = container.firstElementChild
    if (!(scroller instanceof HTMLDivElement)) {
      throw new Error('Expected DataTable to render a scroll container')
    }

    fireEvent.scroll(scroller, { target: { scrollTop: 4_800 } })

    expect(screen.getByText('Row 100')).toBeTruthy()
    expect(screen.queryByText('Row 0')).toBeNull()
    expect(within(table).getAllByRole('row').length).toBeLessThan(30)
  })

  it('renders every row below the virtualization threshold', () => {
    const rows = Array.from({ length: 3 }, (_, index) => ({
      id: String(index),
      name: `Row ${index}`,
    }))

    render(
      <DataTable
        columns={columns}
        getRowKey={(row) => row.id}
        rows={rows}
        virtualizeAfter={100}
      />,
    )

    expect(screen.getByText('Row 0')).toBeTruthy()
    expect(screen.getByText('Row 1')).toBeTruthy()
    expect(screen.getByText('Row 2')).toBeTruthy()
  })
})
