import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "bun:test";

import { StatusBadge } from "@/components/reimbursements/StatusBadge.tsx";

describe("StatusBadge", () => {
  it("renders DRAFT with gray styling", () => {
    render(<StatusBadge status="DRAFT" />);
    const badge = screen.getByText("Draft");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-gray-100");
  });

  it("renders SUBMITTED with blue styling", () => {
    render(<StatusBadge status="SUBMITTED" />);
    const badge = screen.getByText("Submitted");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-blue-100");
  });

  it("renders APPROVED with green styling", () => {
    render(<StatusBadge status="APPROVED" />);
    const badge = screen.getByText("Approved");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-green-100");
  });

  it("renders REJECTED with red styling", () => {
    render(<StatusBadge status="REJECTED" />);
    const badge = screen.getByText("Rejected");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-red-100");
  });

  it("renders PAID with purple styling", () => {
    render(<StatusBadge status="PAID" />);
    const badge = screen.getByText("Paid");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-purple-100");
  });

  it("renders CANCELLED with orange styling", () => {
    render(<StatusBadge status="CANCELLED" />);
    const badge = screen.getByText("Cancelled");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-orange-100");
  });
});
