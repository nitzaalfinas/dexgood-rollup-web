import { ReactNode, useEffect, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "full" | number;
  disableBackdropClose?: boolean;
}

// Utility to map maxWidth prop to Tailwind classes or inline style
function getMaxWidth(maxWidth: ModalProps["maxWidth"]) {
  if (typeof maxWidth === "number")
    return { className: "", style: { maxWidth } } as const;
  switch (maxWidth) {
    case "sm":
      return { className: "max-w-sm" } as const;
    case "md":
      return { className: "max-w-md" } as const;
    case "lg":
      return { className: "max-w-lg" } as const;
    case "full":
      return { className: "max-w-none w-full" } as const;
    default:
      return { className: "max-w-md" } as const;
  }
}

const Modal = ({
  open,
  onClose,
  title,
  children,
  maxWidth = "md",
  disableBackdropClose,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Body scroll lock
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  // Click outside handler
  const onBackdropClick = (e: React.MouseEvent) => {
    if (disableBackdropClose) return;
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!open) return null;

  const widthConf = getMaxWidth(maxWidth);
  const isFull = maxWidth === "full";

  return (
    <div
      className={`fixed inset-0 z-50 flex ${
        isFull ? "" : "items-end sm:items-center px-2 sm:px-4 py-4"
      } justify-center`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal" : undefined}
      onMouseDown={onBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs animate-fade-in" />

      {/* Panel */}
      <div
        ref={dialogRef}
        className={`relative ${
          isFull ? "h-full" : ""
        } w-full ${widthConf.className || ""} ${
          isFull ? "rounded-none" : "rounded-xl"
        } bg-main-bg border ${
          isFull ? "border-transparent" : "border-gray-800"
        } animate-scale-in overflow-hidden flex flex-col`}
        style={widthConf.style}
        onMouseDown={(e) => e.stopPropagation()} // Mencegah bubbling ke backdrop
      >
        {/* Header */}
        {(title || true) && (
          <div className="flex items-start gap-3 px-4 pt-4 pb-3">
            {title && (
              <h2
                id="simple-modal-title"
                className="text-sm font-medium text-main-text truncate"
              >
                {title}
              </h2>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto hover:cursor-pointer hover:text-main-link"
              aria-label="Close modal"
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {/* Body */}
        <div
          className={`px-4 pb-4 text-main-text text-xs overflow-y-auto ${
            isFull ? "flex-1" : "max-h-[60vh]"
          }`}
        >
          {children}
        </div>
      </div>

      {/* Simple animations (scoped) */}
      <style>{`
        .animate-fade-in { animation: sm-fade-in .18s ease-out; }
        .animate-scale-in { animation: sm-scale-in .22s cubic-bezier(.4,.8,.4,1); }
        @keyframes sm-fade-in { from { opacity:0 } to { opacity:1 } }
        @keyframes sm-scale-in { from { opacity:0; transform: translateY(20px) scale(.96); } to { opacity:1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};

export default Modal;
