import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "bun:test";

import { StatsCard } from "@/components/shared/StatsCard.tsx";

function IconMock({ className }: { className?: string }) {
  return <svg aria-label="icon" className={className} />;
}

describe("StatsCard", () => {
  it("renders the label and value", () => {
    render(<StatsCard icon={IconMock} label="Total" value={42} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <StatsCard className="border-red-200" icon={IconMock} label="Total" value={42} />,
    );
    expect(container.firstChild).toHaveClass("border-red-200");
  });

  it("renders the icon", () => {
    render(<StatsCard icon={IconMock} label="Total" value={42} />);
    expect(screen.getByLabelText("icon")).toBeInTheDocument();
  });
});
