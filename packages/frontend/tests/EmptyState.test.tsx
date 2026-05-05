import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "bun:test";

import { EmptyState } from "@/components/shared/EmptyState.tsx";

describe("EmptyState", () => {
  it("renders the title and description", () => {
    render(<EmptyState description="Nothing here" title="No data" />);
    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders with default values when not provided", () => {
    render(<EmptyState />);
    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.getByText("Nothing here yet.")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    render(
      <EmptyState
        action={{ href: "/create", label: "Create" }}
        title="No items"
      />,
    );
    expect(screen.getByRole("link", { name: "Create" })).toHaveAttribute("href", "/create");
  });

  it("does not render action button when not provided", () => {
    render(<EmptyState title="No items" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
