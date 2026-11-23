import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Modal } from "./index";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

function renderModal(size: "sm" | "md" | "lg" | "xl" = "md") {
  const onOpen = vi.fn();
  const onClose = vi.fn();

  render(
    <Modal isOpen={true} onOpen={onOpen} onClose={onClose}>
      <Modal.Trigger>Open Modal</Modal.Trigger>

      <Modal.Content size={size}>
        <Modal.Header>
          Modal Heading
        </Modal.Header>

        <Modal.Body>
          Modal content
        </Modal.Body>

        <Modal.Footer>
          Modal actions
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );

  return { onOpen, onClose };
}

describe("Modal", () => {
  it("renders modal content when open", () => {
    renderModal();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Modal Heading")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("does not render modal content when closed", () => {
    render(
      <Modal isOpen={false} onOpen={vi.fn()} onClose={vi.fn()}>
        <Modal.Content>
          <Modal.Body>Hidden content</Modal.Body>
        </Modal.Content>
      </Modal>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens modal when trigger is clicked", () => {
    const { onOpen } = renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Open Modal" }));

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("closes modal when Escape is pressed", () => {
    const { onClose } = renderModal();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes modal when backdrop is clicked", () => {
    const { onClose } = renderModal();

    fireEvent.mouseDown(screen.getByRole("dialog").parentElement!);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not close modal when its content is clicked", () => {
    const { onClose } = renderModal();

    fireEvent.mouseDown(screen.getByText("Modal content"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("locks body scrolling while open", () => {
    renderModal();

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("supports different modal sizes", () => {
    const { unmount } = render(
      <Modal isOpen={true} onOpen={vi.fn()} onClose={vi.fn()}>
        <Modal.Content size="lg">
          <Modal.Body>Large modal</Modal.Body>
        </Modal.Content>
      </Modal>
    );

    expect(screen.getByRole("dialog")).toHaveClass("max-w-3xl");

    unmount();
  });
});