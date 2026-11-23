import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DataTable from "./DataTable";
import type { DataTableColumn } from "./DataTable.types";

interface TestUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

const users: TestUser[] = [
  {
    id: 1,
    name: "Rahul",
    email: "rahul@gmail.com",
    role: "Admin",
  },
  {
    id: 2,
    name: "Priya",
    email: "priya@gmail.com",
    role: "User",
  },
];

const columns: DataTableColumn<TestUser>[] = [
  {
    key: "name",
    header: "Name",
    accessor: "name",
  },
  {
    key: "email",
    header: "Email",
    accessor: "email",
  },
  {
    key: "role",
    header: "Role",
    accessor: "role",
  },
];

afterEach(() => {
  cleanup();
});

describe("DataTable", () => {
  it("renders dynamic column headers", () => {
    render(
      <DataTable
        columns={columns}
        data={users}
        getRowId={(user) => user.id}
      />
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
  });

  it("renders dynamic row data", () => {
    render(
      <DataTable
        columns={columns}
        data={users}
        getRowId={(user) => user.id}
      />
    );

    expect(screen.getByText("Rahul")).toBeInTheDocument();
    expect(screen.getByText("rahul@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("Priya")).toBeInTheDocument();
    expect(screen.getByText("priya@gmail.com")).toBeInTheDocument();
  });

  it("renders custom cell content", () => {
    const customColumns: DataTableColumn<TestUser>[] = [
      {
        key: "name",
        header: "Name",
        render: (user) => <strong>{user.name}</strong>,
      },
    ];

    render(
      <DataTable
        columns={customColumns}
        data={users}
        getRowId={(user) => user.id}
      />
    );

    expect(screen.getByText("Rahul").tagName).toBe("STRONG");
  });

  it("displays loading state", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        getRowId={(user) => user.id}
        loading
      />
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays empty state when no data is available", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        getRowId={(user) => user.id}
        emptyMessage="No users found."
      />
    );

    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });

  it("calls sorting callback when a sortable column is clicked", () => {
    const onSort = vi.fn();

    const sortableColumns: DataTableColumn<TestUser>[] = [
      {
        key: "name",
        header: "Name",
        accessor: "name",
        sortable: true,
      },
    ];

    render(
      <DataTable
        columns={sortableColumns}
        data={users}
        getRowId={(user) => user.id}
        onSort={onSort}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Name" }));

    expect(onSort).toHaveBeenCalledWith({
      key: "name",
      direction: "asc",
    });
  });

  it("calls pagination callback when Next is clicked", () => {
    const onPageChange = vi.fn();

    render(
      <DataTable
        columns={columns}
        data={users}
        getRowId={(user) => user.id}
        pagination={{
          currentPage: 1,
          totalPages: 3,
          onPageChange,
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("disables pagination buttons on first and last pages", () => {
    const onPageChange = vi.fn();

    const { rerender } = render(
      <DataTable
        columns={columns}
        data={users}
        getRowId={(user) => user.id}
        pagination={{
          currentPage: 1,
          totalPages: 3,
          onPageChange,
        }}
      />
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    rerender(
      <DataTable
        columns={columns}
        data={users}
        getRowId={(user) => user.id}
        pagination={{
          currentPage: 3,
          totalPages: 3,
          onPageChange,
        }}
      />
    );

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});