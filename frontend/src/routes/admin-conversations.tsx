import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import {
  Search, ShieldCheck, Download, Calendar, ExternalLink,
  MessageSquare, FileText, Info, AlertTriangle, Eye, ArrowRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchConversations, fetchMessages, type Conversation, type ChatMessage } from "@/lib/api";

export function AdminConversationsPage() {
  const [activeAuditId, setActiveAuditId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ["admin_conversations"],
    queryFn: fetchConversations,
  });

  // Fetch messages for active conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery<ChatMessage[]>({
    queryKey: ["admin_chat_messages", activeAuditId],
    queryFn: () => fetchMessages(activeAuditId!),
    enabled: activeAuditId !== null,
  });

  const activeConversation = conversations.find(c => c.audit_id === activeAuditId);

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    const matchesSearch = 
      c.audit_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.auditor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `#${c.audit_id}`.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || c.audit_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export chat log as CSV/JSON
  const handleExport = () => {
    if (!activeConversation || messages.length === 0) return;
    
    // Create export data
    const exportData = messages.map(m => ({
      message_id: m.id,
      timestamp: m.created_at,
      sender_name: m.sender_name,
      sender_role: m.sender_role,
      type: m.message_type,
      content: m.content,
      file_name: m.file_name || "",
      file_size: m.file_size || 0,
      status: m.status
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat_log_audit_${activeConversation.audit_id}_${activeConversation.company_name.replace(/\s+/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "-";
    }
  };

  return (
    <PageShell
      title="Communication Monitoring"
      description="Read-only access to Auditor-Company chat logs for security compliance and audit oversight."
    >
      <div style={{ display: "flex", gap: "1.5rem", flexDirection: "column" }}>
        
        {/* Statistics Strip */}
        <div className="grid grid-3" style={{ gap: "1rem" }}>
          <div className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ padding: "0.5rem", background: "rgba(99,102,241,0.1)", color: "#6366f1", borderRadius: "0.5rem" }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase" }}>Total Conversations</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{conversations.length}</div>
            </div>
          </div>
          <div className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ padding: "0.5rem", background: "rgba(16,185,129,0.1)", color: "#10b981", borderRadius: "0.5rem" }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase" }}>Audits Covered</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {conversations.filter(c => c.unread_count === 0).length} / {conversations.length}
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ padding: "0.5rem", background: "rgba(245,158,11,0.1)", color: "#f59e0b", borderRadius: "0.5rem" }}>
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase" }}>Active Checkups</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {conversations.filter(c => c.audit_status === "In Progress").length}
              </div>
            </div>
          </div>
        </div>

        {/* Table & Log Split Screen */}
        <div style={{
          display: "flex", gap: "1.5rem", flexWrap: "wrap", width: "100%"
        }}>
          
          {/* List panel */}
          <div style={{ flex: "2 1 500px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* Filter controls */}
            <div className="card" style={{ padding: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <div className="input-icon" style={{ flex: 1, minWidth: "200px" }}>
                <Search size={15} className="icon" />
                <input
                  type="text"
                  placeholder="Search audit scope, company or auditor..."
                  className="input input-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="select"
                style={{ width: "150px", height: "2.125rem", padding: "0 0.5rem", fontSize: "0.8rem" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>

            {/* Conversations Table */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Audit</th>
                      <th>Company</th>
                      <th>Auditor</th>
                      <th>Last Message</th>
                      <th>Last Updated</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingConversations ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>Loading monitoring list...</td>
                      </tr>
                    ) : filteredConversations.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>No matching conversations found.</td>
                      </tr>
                    ) : (
                      filteredConversations.map(c => {
                        const isSelected = c.audit_id === activeAuditId;
                        return (
                          <tr
                            key={c.audit_id}
                            style={{
                              background: isSelected ? "rgba(99,102,241,0.06)" : "transparent",
                              cursor: "pointer"
                            }}
                            onClick={() => setActiveAuditId(c.audit_id)}
                          >
                            <td>
                              <div style={{ fontWeight: 600 }}>{c.audit_name}</div>
                              <div style={{ fontSize: "0.72rem", opacity: 0.6 }}>ID: #{c.audit_id}</div>
                            </td>
                            <td>{c.company_name}</td>
                            <td>{c.auditor_name}</td>
                            <td style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.last_message || "-"}
                            </td>
                            <td>{formatDateTime(c.last_updated)}</td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline"}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveAuditId(c.audit_id);
                                }}
                              >
                                <Eye size={12} /> Monitor
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Read Only Log view panel */}
          <div style={{ flex: "1 1 340px", minWidth: "300px" }}>
            <div className="card" style={{ height: "550px", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
              {activeConversation ? (
                <>
                  {/* Log Header */}
                  <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                      <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                        Audit #{activeConversation.audit_id} Log
                      </h3>
                      <button className="btn btn-secondary btn-sm" onClick={handleExport} style={{ padding: "0.2rem 0.5rem" }} title="Export log as JSON">
                        <Download size={12} /> Export
                      </button>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                      Between: <strong>{activeConversation.company_name}</strong> & <strong>{activeConversation.auditor_name}</strong>
                    </div>
                  </div>

                  {/* Warning banner */}
                  <div style={{
                    padding: "0.5rem 1rem", background: "rgba(245,158,11,0.08)",
                    borderBottom: "1px solid rgba(245,158,11,0.15)", color: "#f59e0b",
                    fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "0.5rem"
                  }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                    <span>Read-only Monitor View. Sending messages is disabled.</span>
                  </div>

                  {/* Scrollable message history */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {loadingMessages ? (
                      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>Loading message logs...</div>
                    ) : messages.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--muted-foreground)", fontSize: "0.85rem" }}>
                        No messages logged for this conversation.
                      </div>
                    ) : (
                      messages.map(m => {
                        const isCompany = m.sender_role === "company_user";
                        return (
                          <div key={m.id} style={{ display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "0.375rem", padding: "0.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem", fontSize: "0.7rem" }}>
                              <span style={{ fontWeight: 700, color: isCompany ? "#6366f1" : "#10b981" }}>
                                {m.sender_name} ({m.sender_role.replace("_", " ")})
                              </span>
                              <span style={{ opacity: 0.6 }}>{formatDateTime(m.created_at)}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: "0.78rem", whiteSpace: "pre-line", wordBreak: "break-all" }}>
                              {m.message_type === "text" ? m.content : `[Attachment: ${m.file_name || "File"}] ${m.content}`}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", color: "var(--muted-foreground)", padding: "2rem", textAlign: "center" }}>
                  <Eye size={36} style={{ opacity: 0.2, marginBottom: "1rem" }} />
                  <h4>Select a conversation to monitor details</h4>
                  <p style={{ fontSize: "0.75rem", maxWidth: "200px", marginTop: "0.5rem" }}>
                    Click "Monitor" next to any conversation row.
                  </p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </PageShell>
  );
}
