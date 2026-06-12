import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SocAutocomplete from "../../SocAutocomplete";

const MOCK_OPTIONS = [
  { code: "11-1011.00", parent: "11-1011", title: "Chief Executives" },
  { code: "15-1252.00", parent: "15-1252", title: "Software Developers" },
  { code: "15-1253.00", parent: "15-1253", title: "Software QA Analysts and Testers" },
];

describe("SocAutocomplete", () => {
  beforeEach(() => {
    // jsdom does not implement scrollIntoView, used by the highlight effect
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(MOCK_OPTIONS),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows matching options when typing", async () => {
    render(<SocAutocomplete value="" onSelect={vi.fn()} />);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "software" } });

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Software Developers/ })).toBeInTheDocument();
    });
    expect(screen.getByRole("option", { name: /Software QA Analysts/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Chief Executives/ })).not.toBeInTheDocument();
  });

  it("selects an option on click and reports the parent SOC code", async () => {
    const onSelect = vi.fn();
    render(<SocAutocomplete value="" onSelect={onSelect} />);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "software dev" } });

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Software Developers/ })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("option", { name: /Software Developers/ }));

    expect(onSelect).toHaveBeenCalledWith("15-1252", "15-1252.00 – Software Developers");
  });

  it("supports keyboard navigation with arrow keys and Enter", async () => {
    const onSelect = vi.fn();
    render(<SocAutocomplete value="" onSelect={onSelect} />);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "software" } });

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelect).toHaveBeenCalledWith(
      "15-1253",
      "15-1253.00 – Software QA Analysts and Testers"
    );
  });

  it("closes the dropdown on Escape", async () => {
    render(<SocAutocomplete value="" onSelect={vi.fn()} />);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "software" } });

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("syncs the input when the value prop changes externally", async () => {
    const { rerender } = render(<SocAutocomplete value="" onSelect={vi.fn()} />);

    rerender(<SocAutocomplete value="15-1252 – Software Developers" onSelect={vi.fn()} />);

    expect(screen.getByRole("combobox")).toHaveValue("15-1252 – Software Developers");
  });
});
