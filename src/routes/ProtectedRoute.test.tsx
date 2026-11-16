// @vitest-environment jsdom

import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn()
}));

const mockedUseAuth = vi.mocked(useAuth);

function LocationDisplay() {
  const location = useLocation();

  return (
    <div>
      <span>{location.pathname}</span>
      <span data-testid="redirect-state">
        {location.state?.from?.pathname || ""}
      </span>
    </div>
  );
}

function renderProtectedRoute(initialPath = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<LocationDisplay />} />
        <Route path="/unauthorized" element={<h1>Access Denied</h1>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<h1>Dashboard</h1>} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["Administrator"]} />}>
          <Route path="/users" element={<h1>User Management</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays loading while checking the session", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: true
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute();

    expect(screen.getByText("Checking your session...")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute();

    expect(screen.getByText("/login")).toBeInTheDocument();
    expect(screen.getByTestId("redirect-state")).toHaveTextContent("/dashboard");
  });

  it("allows authenticated users to access the dashboard", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        role: "Support Agent"
      },
      loading: false
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute();

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("denies Support Agents access to Administrator-only routes", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        role: "Support Agent"
      },
      loading: false
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute("/users");

    expect(screen.getByRole("heading", { name: "Access Denied" })).toBeInTheDocument();
  });

  it("allows Administrators to access Administrator-only routes", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        role: "Administrator"
      },
      loading: false
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute("/users");

    expect(screen.getByRole("heading", { name: "User Management" })).toBeInTheDocument();
  });
});