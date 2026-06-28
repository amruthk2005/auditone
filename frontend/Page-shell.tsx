 children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    <div className="flex flex-col">
      <div
        className="border-b px-6 py-6"
        style={{ background: "var(--gradient-header)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-primary-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-primary-foreground/80">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
      <div className="flex flex-col gap-6 p-6">{children}</div>
    </div>
  );
}