import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Legend from "../Legend";

describe("Legend component", () => {
  it("should render all wage levels", () => {
    render(<Legend />);
    
    expect(screen.getByText("Level I (Entry)")).toBeInTheDocument();
    expect(screen.getByText("Level II (Qualified)")).toBeInTheDocument();
    expect(screen.getByText("Level III (Experienced)")).toBeInTheDocument();
    expect(screen.getByText("Level IV (Fully Competent)")).toBeInTheDocument();
  });

  it("should have proper ARIA attributes", () => {
    render(<Legend />);
    
    const legend = screen.getByRole("region", { name: /wage level legend/i });
    expect(legend).toBeInTheDocument();
  });
});

