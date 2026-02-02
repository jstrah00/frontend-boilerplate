import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../data-table"

interface TestData {
  id: string
  name: string
  email: string
}

const testData: TestData[] = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  { id: "2", name: "Jane Smith", email: "jane@example.com" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com" },
]

const columns: ColumnDef<TestData>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
]

describe("DataTable", () => {
  it("renders table with data", () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
      />
    )

    expect(screen.getByText("Name")).toBeInTheDocument()
    expect(screen.getByText("Email")).toBeInTheDocument()
    expect(screen.getByText("John Doe")).toBeInTheDocument()
    expect(screen.getByText("jane@example.com")).toBeInTheDocument()
  })

  it("shows empty state when no data", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="No records found"
        emptyDescription="Try adding some data"
      />
    )

    expect(screen.getByText("No records found")).toBeInTheDocument()
    expect(screen.getByText("Try adding some data")).toBeInTheDocument()
  })

  it("shows loading state", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        isLoading={true}
      />
    )

    // Skeleton loaders should be visible
    const skeletons = document.querySelectorAll('[data-testid="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("renders pagination when provided", () => {
    const mockPageChange = vi.fn()

    render(
      <DataTable
        columns={columns}
        data={testData}
        pagination={{
          pageIndex: 0,
          pageSize: 10,
          totalPages: 3,
          totalItems: 30,
          onPageChange: mockPageChange,
        }}
      />
    )

    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument()
    expect(screen.getByText(/30 total items/i)).toBeInTheDocument()
  })

  it("renders search input when onSearch is provided", () => {
    const mockSearch = vi.fn()

    render(
      <DataTable
        columns={columns}
        data={testData}
        onSearch={mockSearch}
        searchPlaceholder="Search users..."
      />
    )

    const searchInput = screen.getByPlaceholderText("Search users...")
    expect(searchInput).toBeInTheDocument()
  })
})
