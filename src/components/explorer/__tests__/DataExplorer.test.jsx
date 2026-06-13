import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DataExplorer from "../DataExplorer";

describe("DataExplorer accessibility & navigation", () => {
  beforeEach(() => {
    // jsdom lacks scrollIntoView (used by some inputs); stub it.
    Element.prototype.scrollIntoView = vi.fn();
    // /api/overview returns a valid (empty) payload.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ totals: {}, topStates: [], meta: [] }),
      })
    );
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.style.overflow = "";
  });

  it("renders nothing when closed", () => {
    const { container } = render(<DataExplorer isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("exposes a dialog, tablist, tabs, and a tabpanel", async () => {
    render(<DataExplorer isOpen onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(6);
    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      "explorer-tab-overview"
    );
  });

  it("locks body scroll while open", () => {
    render(<DataExplorer isOpen onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("switches the selected tab on click", async () => {
    render(<DataExplorer isOpen onClose={vi.fn()} />);
    const permTab = screen.getByRole("tab", { name: "PERM" });
    fireEvent.click(permTab);
    await waitFor(() => expect(permTab).toHaveAttribute("aria-selected", "true"));
    expect(window.location.search).toContain("tab=perm");
  });

  it("moves selection with ArrowRight (WAI-ARIA tabs pattern)", async () => {
    render(<DataExplorer isOpen onClose={vi.fn()} />);
    const tablist = screen.getByRole("tablist");
    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "Employers" })).toHaveAttribute(
        "aria-selected",
        "true"
      )
    );
  });

  it("shows a 'Live data' pill when the database responds", async () => {
    render(<DataExplorer isOpen onClose={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("Live data")).toBeInTheDocument());
  });

  it("shows 'Data unavailable' when the database can't be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    render(<DataExplorer isOpen onClose={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("Data unavailable")).toBeInTheDocument());
  });

  it("calls onClose on Escape", () => {
    const onClose = vi.fn();
    render(<DataExplorer isOpen onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
