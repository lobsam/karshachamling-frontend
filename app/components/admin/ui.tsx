import { useEffect, useRef, type ReactNode } from "react";

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-serif text-4xl text-maroon-900">{title}</h1>
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
};

const VARIANTS = {
  primary: "bg-maroon-700 text-white hover:bg-maroon-800",
  secondary: "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  ghost: "text-stone-700 hover:bg-stone-200/60",
};

export function Button({ variant = "secondary", size = "md", className = "", ...props }: ButtonProps) {
  const sz = size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm";
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${sz} ${VARIANTS[variant]} ${className}`}
    />
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}

const INPUT =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-maroon-700 focus:outline-none focus:ring-1 focus:ring-maroon-700";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${INPUT} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${INPUT} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${INPUT} ${props.className ?? ""}`} />;
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-green-100 text-green-800",
    paid: "bg-green-100 text-green-800",
    draft: "bg-stone-200 text-stone-700",
    created: "bg-amber-100 text-amber-800",
    failed: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = { created: "pending" };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-stone-100"}`}>
      {labels[status] ?? status}
    </span>
  );
}

export function Alert({ kind = "error", children }: { kind?: "error" | "success"; children: ReactNode }) {
  if (!children) return null;
  const cls = kind === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800";
  return (
    <p role={kind === "error" ? "alert" : "status"} className={`rounded-md px-3 py-2 text-sm ${cls}`}>
      {children}
    </p>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

/** Native <dialog>: focus trapping, Esc to close and backdrop for free. */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={`m-auto w-full rounded-xl p-0 shadow-xl backdrop:bg-black/40 ${wide ? "max-w-5xl" : "max-w-lg"}`}
    >
      {open && (
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl text-maroon-900">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="text-2xl leading-none text-stone-400 hover:text-stone-700">
              ×
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-stone-500">{children}</p>;
}
