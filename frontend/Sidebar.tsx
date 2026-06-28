return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">A1</div>
          {!collapsed && <span className="font-semibold tracking-tight">AuditOne</span>}
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <span className="text-sm font-bold text-primary-foreground">A1</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              Audit<span className="text-primary-foreground/70">One</span>
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (