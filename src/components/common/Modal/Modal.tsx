import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type ButtonHTMLAttributes
} from "react";

interface ModalContextType {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

interface ModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: ReactNode;
}

interface ModalTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

interface ModalContentProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

interface ModalSectionProps {
  children: ReactNode;
  className?: string;
}

const ModalContext = createContext<ModalContextType | null>(null);

function useModalContext() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("Modal components must be used inside Modal.");
  }

  return context;
}

function ModalRoot({
  isOpen,
  onOpen,
  onClose,
  children
}: ModalProps) {
  return (
    <ModalContext.Provider value={{ isOpen, onOpen, onClose }}>
      {children}
    </ModalContext.Provider>
  );
}

function ModalTrigger({
  children,
  onClick,
  ...props
}: ModalTriggerProps) {
  const { onOpen } = useModalContext();

  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          onOpen();
        }
      }}
    >
      {children}
    </button>
  );
}

function ModalContent({
  children,
  size = "md"
}: ModalContentProps) {
  const { isOpen, onClose } = useModalContext();
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    contentRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl"
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={contentRef}
        tabIndex={-1}
        className={`max-h-[92vh] w-full ${sizeClasses[size]} overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xl shadow-slate-950/20 outline-none sm:p-7`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {children}
      </section>
    </div>
  );
}

function ModalHeader({ children, className = "" }: ModalSectionProps) {
  return (
    <header
      id="modal-title"
      className={`mb-6 ${className}`}
    >
      {children}
    </header>
  );
}

function ModalBody({ children, className = "" }: ModalSectionProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

function ModalFooter({ children, className = "" }: ModalSectionProps) {
  return (
    <footer className={className}>
      {children}
    </footer>
  );
}

const Modal = Object.assign(ModalRoot, {
  Trigger: ModalTrigger,
  Content: ModalContent,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter
});

export default Modal;