export function Button({ variant = "primary", className = "", children, ...rest }) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium font-body tracking-tight transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40";

  const variants = {
    primary: "btn-primary bg-cyan text-void hover:bg-cyan/90",
    secondary: "bg-transparent border border-line text-ink hover:border-cyan hover:text-cyan",
    ghost: "bg-transparent text-muted hover:text-ink",
    danger: "bg-transparent border border-danger/50 text-danger hover:bg-danger/10",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
