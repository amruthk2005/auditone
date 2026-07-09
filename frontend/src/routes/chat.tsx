import { useState, useEffect, useRef } from "react";
import { PageShell } from "@/components/page-shell";
import {
  Search, MessageSquare, Send, Paperclip, Image as ImageIcon,
  FileText, Check, CheckCheck, Landmark, ShieldCheck, Activity,
  Users, Building, AlertCircle, Info, FileSpreadsheet, Share2,
  ExternalLink, Download
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  uploadChatFile,
  type Conversation,
  type ChatMessage
} from "@/lib/api";
import { getMockUser } from "@/lib/auth";

export function ChatPage() {
  const queryClient = useQueryClient();
  const currentUser = getMockUser();
  const role = currentUser?.role?.toLowerCase() ?? "company_user";

  const [activeAuditId, setActiveAuditId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active">("all");
  const [messageText, setMessageText] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchMsgQuery, setSearchMsgQuery] = useState("");
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: conversations = [], isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ["chat_conversations"],
    queryFn: fetchConversations,
    refetchInterval: 5000, // poll conversations every 5s to check for unread
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery<ChatMessage[]>({
    queryKey: ["chat_messages", activeAuditId],
    queryFn: () => fetchMessages(activeAuditId!),
    enabled: activeAuditId !== null,
    refetchInterval: 3000, // poll messages every 3s for real-time feel
  });

  // Mutations
  const sendMutation = useMutation({
    mutationFn: (msgData: { content: string; message_type?: string; file_name?: string | null; file_size?: number | null }) => 
      sendMessage(activeAuditId!, msgData),
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["chat_messages", activeAuditId] });
      queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadChatFile(activeAuditId!, file),
    onSuccess: (data) => {
      // Send attachment message based on file type
      const ext = data.file_name.split(".").pop()?.toLowerCase();
      let msgType = "file";
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
        msgType = "image";
      } else if (ext === "pdf") {
        msgType = "pdf";
      } else if (["xls", "xlsx", "csv"].includes(ext || "")) {
        msgType = "excel";
      }
      
      sendMutation.mutate({
        content: data.file_url,
        message_type: msgType,
        file_name: data.file_name,
        file_size: data.file_size
      });
    }
  });

  // Set default active conversation
  useEffect(() => {
    if (conversations.length > 0 && activeAuditId === null) {
      setActiveAuditId(conversations[0].audit_id);
    }
  }, [conversations, activeAuditId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConversation = conversations.find(c => c.audit_id === activeAuditId);

  // Filters and searches
  const filteredConversations = conversations.filter(c => {
    const matchesSearch = 
      c.audit_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.auditor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `#${c.audit_id}`.includes(searchQuery);

    const matchesFilter = activeFilter === "all" || c.audit_status === "In Progress";
    return matchesSearch && matchesFilter;
  });

  const filteredMessages = messages.filter(m => {
    if (!searchMsgQuery) return true;
    return m.content.toLowerCase().includes(searchMsgQuery.toLowerCase()) ||
           (m.file_name && m.file_name.toLowerCase().includes(searchMsgQuery.toLowerCase()));
  });

  const handleSend = () => {
    if (!messageText.trim() || activeAuditId === null) return;
    sendMutation.mutate({ content: messageText, message_type: "text" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeAuditId !== null) {
      uploadMutation.mutate(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Quick Action triggers
  const handleQuickAction = (type: string) => {
    setShowQuickActions(false);
    if (activeAuditId === null) return;

    if (type === "share_product") {
      sendMutation.mutate({
        message_type: "product_details",
        content: "### Shared Product Details\n**Product**: Wireless Mouse (SKU: WM-102)\n**Category**: Peripherals\n**Location**: Warehouse A\n**Cost**: $45\n**Status**: In Use\n*Verified by company coordinator.*"
      });
    } else if (type === "share_report") {
      sendMutation.mutate({
        message_type: "audit_report",
        content: "### Shared Audit Report\n**Report Name**: Q1 Inventory Snapshot\n**Format**: PDF\n**Generated Date**: 2026-07-04\n**Status**: Preliminary Draft"
      });
    } else if (type === "share_qr") {
      sendMutation.mutate({
        message_type: "qr_image",
        content: "### QR Code Shared\n**Code ID**: qr-001\n**Content**: QR-WM102-A1\n**Scans Recorded**: 14",
        file_name: "qr-code-wm102.png"
      });
    } else if (type === "share_remarks") {
      sendMutation.mutate({
        message_type: "audit_remarks",
        content: "### Auditor Field Remarks\n**Observation**: Located 14 computing assets. 2 items showing physical wear but in service.\n**Recommendation**: Schedule maintenance check for printer in Block B."
      });
    } else if (type === "share_validation") {
      sendMutation.mutate({
        message_type: "validation_report",
        content: "### Asset Validation Summary\n**Audit Session**: sess-001\n**Total Assets Counted**: 120\n**Discrepancies**: 0 Mismatch, 0 Missing"
      });
    } else if (type === "share_mock_images") {
      sendMutation.mutate({
        message_type: "image",
        content: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=400&q=80",
        file_name: "warehouse_aisle_check.jpg",
        file_size: 145000
      });
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return "";
    }
  };

  const renderStatus = (status: string) => {
    if (status === "seen") return <span title="Seen"><CheckCheck size={14} style={{ color: "#38bdf8" }} /></span>;
    if (status === "delivered") return <span title="Delivered"><CheckCheck size={14} style={{ color: "var(--muted-foreground)" }} /></span>;
    return <span title="Sent"><Check size={14} style={{ color: "var(--muted-foreground)" }} /></span>;
  };

  const formatBytes = (bytes?: number | null) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Helper to render special structured cards in message bubbles
  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.message_type === "text") {
      return <p style={{ margin: 0, whiteSpace: "pre-line", wordBreak: "break-word" }}>{msg.content}</p>;
    }
    
    if (msg.message_type === "image") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <img
            src={msg.content}
            alt={msg.file_name || "Uploaded Image"}
            style={{ maxWidth: "260px", maxHeight: "180px", borderRadius: "0.375rem", display: "block" }}
            onError={(e) => {
              // Fallback image if unsplash url or local blob url doesn't resolve
              e.currentTarget.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80";
            }}
          />
          {msg.file_name && (
            <span style={{ fontSize: "0.75rem", opacity: 0.8, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <ImageIcon size={12} /> {msg.file_name} ({formatBytes(msg.file_size)})
            </span>
          )}
        </div>
      );
    }

    if (msg.message_type === "pdf" || msg.message_type === "excel" || msg.message_type === "file") {
      const isPdf = msg.message_type === "pdf";
      const isExcel = msg.message_type === "excel";
      return (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          background: "rgba(255,255,255,0.06)", borderRadius: "0.5rem",
          padding: "0.625rem 0.875rem", minWidth: "220px", border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{
            width: "2.25rem", height: "2.25rem", borderRadius: "0.375rem",
            background: isPdf ? "rgba(239,68,68,0.15)" : isExcel ? "rgba(34,197,94,0.15)" : "rgba(168,85,247,0.15)",
            color: isPdf ? "#ef4444" : isExcel ? "#22c55e" : "#a855f7",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {isPdf ? <FileText size={18} /> : isExcel ? <FileSpreadsheet size={18} /> : <Paperclip size={18} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {msg.file_name || "Attachment"}
            </div>
            <div style={{ fontSize: "0.72rem", opacity: 0.7 }}>{formatBytes(msg.file_size)}</div>
          </div>
          <a
            href={msg.content}
            download={msg.file_name || "file"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", opacity: 0.8, padding: "0.25rem" }}
            title="Download"
          >
            <Download size={16} />
          </a>
        </div>
      );
    }

    // Structured custom message cards
    if (["product_details", "audit_report", "qr_image", "audit_remarks", "validation_report"].includes(msg.message_type)) {
      const isRemark = msg.message_type === "audit_remarks" || msg.message_type === "validation_report";
      return (
        <div style={{
          background: isRemark ? "rgba(16,185,129,0.08)" : "rgba(99,102,241,0.08)",
          border: `1px solid ${isRemark ? "rgba(16,185,129,0.25)" : "rgba(99,102,241,0.25)"}`,
          borderRadius: "0.5rem", padding: "0.75rem", minWidth: "250px", maxWidth: "340px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: isRemark ? "#10b981" : "#6366f1", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <Share2 size={12} />
            {msg.message_type.replace("_", " ")}
          </div>
          
          <div style={{
            fontSize: "0.85rem", whiteSpace: "pre-line", wordBreak: "break-word",
            color: "var(--foreground)", fontFamily: "inherit"
          }}>
            {msg.content.replace(/### .*\n/, "")} {/* strip header markdown if any */}
          </div>

          {msg.message_type === "qr_image" && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "0.375rem", padding: "0.375rem" }}>
              <div style={{ width: "2rem", height: "2rem", background: "#fff", padding: "0.15rem", borderRadius: "0.25rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ border: "2px solid #000", width: "1.5rem", height: "1.5rem" }} title="QR Symbol" />
              </div>
              <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>qr-code-wm102.png</span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <PageShell
      title="Audit Chat Workspace"
      description="Secure messages and document exchange regarding your assigned audits."
    >
      <div style={{
        display: "flex", height: "calc(100vh - 12rem)", minHeight: "550px",
        border: "1px solid var(--border)", borderRadius: "0.875rem",
        overflow: "hidden", background: "var(--card)", position: "relative"
      }}>
        
        {/* ====================================================
            LEFT PANEL: Conversation List
            ==================================================== */}
        <div style={{
          width: "320px", borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column", flexShrink: 0,
          background: "rgba(255,255,255,0.01)"
        }}>
          {/* Header Search */}
          <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)" }}>
            <div className="input-icon" style={{ marginBottom: "0.75rem" }}>
              <Search size={16} className="icon" />
              <input
                type="text"
                placeholder="Search audit, company..."
                className="input input-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "0.25rem", background: "var(--muted)", padding: "0.2rem", borderRadius: "0.375rem" }}>
              <button
                onClick={() => setActiveFilter("all")}
                style={{
                  flex: 1, padding: "0.25rem", fontSize: "0.75rem", fontWeight: 600,
                  border: "none", borderRadius: "0.25rem", cursor: "pointer",
                  background: activeFilter === "all" ? "var(--card)" : "transparent",
                  color: activeFilter === "all" ? "var(--foreground)" : "var(--muted-foreground)"
                }}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter("active")}
                style={{
                  flex: 1, padding: "0.25rem", fontSize: "0.75rem", fontWeight: 600,
                  border: "none", borderRadius: "0.25rem", cursor: "pointer",
                  background: activeFilter === "active" ? "var(--card)" : "transparent",
                  color: activeFilter === "active" ? "var(--foreground)" : "var(--muted-foreground)"
                }}
              >
                Active
              </button>
            </div>
          </div>

          {/* List content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
            {loadingConversations ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                <span className="animate-spin" style={{ display: "inline-block", width: "1.5rem", height: "1.5rem", border: "2px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%" }} />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)", fontSize: "0.85rem" }}>
                <MessageSquare size={24} style={{ margin: "0 auto 0.5rem", opacity: 0.5 }} />
                No conversations found.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = c.audit_id === activeAuditId;
                return (
                  <div
                    key={c.audit_id}
                    onClick={() => setActiveAuditId(c.audit_id)}
                    style={{
                      padding: "0.75rem", borderRadius: "0.5rem", cursor: "pointer",
                      marginBottom: "0.25rem", background: isActive ? "rgba(99,102,241,0.08)" : "transparent",
                      border: `1px solid ${isActive ? "rgba(99,102,241,0.15)" : "transparent"}`,
                      transition: "all 0.15s ease", display: "flex", gap: "0.5rem", flexDirection: "column"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.audit_name}
                      </span>
                      {c.last_updated && (
                        <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", flexShrink: 0 }}>
                          {formatDate(c.last_updated)}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {role === "company_user" ? `Auditor: ${c.auditor_name}` : `Client: ${c.company_name}`}
                      </span>
                      <span style={{ fontSize: "0.7rem", opacity: 0.8, color: "var(--primary-foreground)", background: "var(--primary)", padding: "0.1rem 0.35rem", borderRadius: "999px" }}>
                        #{c.audit_id}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{
                        fontSize: "0.75rem", color: c.unread_count > 0 ? "var(--foreground)" : "var(--muted-foreground)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                        fontWeight: c.unread_count > 0 ? 600 : 400
                      }}>
                        {c.last_message || "No messages yet"}
                      </span>
                      {c.unread_count > 0 && (
                        <span style={{
                          fontSize: "0.7rem", fontWeight: 700, background: "#ef4444", color: "#fff",
                          borderRadius: "999px", padding: "0.1rem 0.4rem", flexShrink: 0
                        }}>
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ====================================================
            CENTER PANEL: Chat Window
            ==================================================== */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", minWidth: 0 }}>
          {activeConversation ? (
            <>
              {/* Top Bar Header */}
              <div style={{
                padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "rgba(255,255,255,0.01)"
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                      {activeConversation.audit_name}
                    </h2>
                    <span className={`status-badge ${activeConversation.audit_status === "Completed" ? "success" : activeConversation.audit_status === "In Progress" ? "warning" : "muted"}`} style={{ fontSize: "0.7rem" }}>
                      {activeConversation.audit_status}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.15rem" }}>
                    <span style={{ display: "inline-block", width: "0.375rem", height: "0.375rem", borderRadius: "50%", background: "#22c55e" }} />
                    <span>Client: <strong>{activeConversation.company_name}</strong></span>
                    <span>•</span>
                    <span>Auditor: <strong>{activeConversation.auditor_name}</strong></span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button
                    onClick={() => setShowMsgSearch(!showMsgSearch)}
                    className={`btn btn-sm ${showMsgSearch ? "btn-secondary" : "btn-outline"}`}
                    title="Search messages"
                  >
                    <Search size={14} />
                  </button>
                </div>
              </div>

              {/* Message Search Bar */}
              {showMsgSearch && (
                <div style={{ padding: "0.5rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", gap: "0.5rem" }}>
                  <div className="input-icon" style={{ flex: 1 }}>
                    <Search size={14} className="icon" />
                    <input
                      type="text"
                      className="input input-sm"
                      placeholder="Search messages in this conversation..."
                      value={searchMsgQuery}
                      onChange={(e) => setSearchMsgQuery(e.target.value)}
                    />
                  </div>
                  {searchMsgQuery && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setSearchMsgQuery("")}>
                      Clear
                    </button>
                  )}
                </div>
              )}

              {/* Message history */}
              <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {loadingMessages ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                    <span className="animate-spin" style={{ display: "inline-block", width: "1.5rem", height: "1.5rem", border: "2px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%" }} />
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--muted-foreground)" }}>
                    <MessageSquare size={36} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                    {searchMsgQuery ? "No messages matching your search query." : "No messages. Start the conversation below!"}
                  </div>
                ) : (
                  filteredMessages.map((msg, index) => {
                    // Check if current user sent it
                    const isMe = msg.sender_role === role;
                    
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: "flex", flexDirection: "column",
                          alignItems: isMe ? "flex-end" : "flex-start",
                          width: "100%"
                        }}
                      >
                        {/* Sender info */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.2rem", fontSize: "0.75rem", opacity: 0.8 }}>
                          <span style={{ fontWeight: 600 }}>{msg.sender_name}</span>
                          <span style={{ fontSize: "0.65rem", padding: "0 0.25rem", borderRadius: "0.25rem", background: "var(--muted)", textTransform: "uppercase" }}>
                            {msg.sender_role.replace("_", " ")}
                          </span>
                        </div>

                        {/* Bubble row */}
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", maxWidth: "70%" }}>
                          <div style={{
                            padding: "0.625rem 0.875rem", borderRadius: "0.75rem",
                            background: isMe ? "var(--primary)" : "var(--muted)",
                            color: isMe ? "var(--primary-foreground)" : "var(--foreground)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                          }}>
                            {renderMessageContent(msg)}
                          </div>
                        </div>

                        {/* Status/Time row */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.15rem", fontSize: "0.65rem", color: "var(--muted-foreground)" }}>
                          <span>{formatTime(msg.created_at)}</span>
                          {isMe && renderStatus(msg.status)}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input section */}
              <div style={{ padding: "1rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                
                {/* Upload elements */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <button className="btn btn-outline btn-sm" onClick={triggerFileUpload} title="Attach document" disabled={uploadMutation.isPending}>
                    <Paperclip size={14} />
                  </button>
                  
                  <div style={{ position: "relative" }}>
                    <button
                      className={`btn btn-sm ${showQuickActions ? "btn-secondary" : "btn-outline"}`}
                      onClick={() => setShowQuickActions(!showQuickActions)}
                      title="Quick actions"
                    >
                      <Share2 size={14} /> Share Context
                    </button>
                    
                    {/* Quick actions popup menu */}
                    {showQuickActions && (
                      <div style={{
                        position: "absolute", bottom: "100%", left: 0, marginBottom: "0.5rem",
                        background: "var(--card)", border: "1px solid var(--border)",
                        borderRadius: "0.5rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                        padding: "0.35rem", minWidth: "180px", zIndex: 10, display: "flex", flexDirection: "column", gap: "0.15rem"
                      }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.25rem 0.5rem", opacity: 0.6, textTransform: "uppercase" }}>
                          Quick Actions
                        </div>
                        {role === "company_user" ? (
                          <>
                            <button className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start", width: "100%" }} onClick={() => handleQuickAction("share_product")}>
                              Share Product Details
                            </button>
                            <button className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start", width: "100%" }} onClick={() => handleQuickAction("share_report")}>
                              Share Audit Report
                            </button>
                            <button className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start", width: "100%" }} onClick={() => handleQuickAction("share_qr")}>
                              Share QR Code
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start", width: "100%" }} onClick={() => handleQuickAction("share_remarks")}>
                              Share Audit Remarks
                            </button>
                            <button className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start", width: "100%" }} onClick={() => handleQuickAction("share_validation")}>
                              Share Validation Report
                            </button>
                            <button className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start", width: "100%" }} onClick={() => handleQuickAction("share_mock_images")}>
                              Share Field Image
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {uploadMutation.isPending && (
                    <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <span className="animate-spin" style={{ display: "inline-block", width: "0.75rem", height: "0.75rem", border: "1px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%" }} />
                      Uploading file...
                    </span>
                  )}
                </div>

                {/* Message text textarea & Send button */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <textarea
                    rows={1}
                    className="input"
                    placeholder="Type a message here..."
                    style={{ flex: 1, resize: "none", padding: "0.5rem 0.75rem", minHeight: "2.5rem", maxHeight: "10rem" }}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <button className="btn btn-primary" style={{ height: "auto", alignSelf: "flex-end" }} onClick={handleSend} disabled={!messageText.trim()}>
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", color: "var(--muted-foreground)" }}>
              <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: "1rem" }} />
              <h3>Select a conversation to start chatting</h3>
            </div>
          )}
        </div>

        {/* ====================================================
            RIGHT PANEL: Audit Context Sidebar
            ==================================================== */}
        {activeConversation && (
          <div style={{
            width: "240px", borderLeft: "1px solid var(--border)",
            display: "flex", flexDirection: "column", flexShrink: 0,
            background: "rgba(255,255,255,0.01)", padding: "1rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.75rem" }}>
              <Info size={16} style={{ color: "var(--primary)" }} />
              <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Audit Context
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8rem" }}>
              <div>
                <span style={{ opacity: 0.6, display: "block" }}>Audit ID</span>
                <strong>#{activeConversation.audit_id}</strong>
              </div>

              <div>
                <span style={{ opacity: 0.6, display: "block" }}>Audit Type</span>
                <strong>{activeConversation.audit_name}</strong>
              </div>

              <div>
                <span style={{ opacity: 0.6, display: "block" }}>Client Company</span>
                <strong>{activeConversation.company_name}</strong>
              </div>

              <div>
                <span style={{ opacity: 0.6, display: "block" }}>Assigned Auditor</span>
                <strong>{activeConversation.auditor_name}</strong>
              </div>

              <div>
                <span style={{ opacity: 0.6, display: "block" }}>Audit Progress</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <div style={{ flex: 1, height: "0.375rem", background: "var(--muted)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${activeConversation.completion_percentage}%`, background: "var(--primary)" }} />
                  </div>
                  <strong style={{ flexShrink: 0 }}>{activeConversation.completion_percentage}%</strong>
                </div>
              </div>

              <div>
                <span style={{ opacity: 0.6, display: "block" }}>Current Status</span>
                <span className={`status-badge ${activeConversation.audit_status === "Completed" ? "success" : activeConversation.audit_status === "In Progress" ? "warning" : "muted"}`} style={{ display: "inline-block", marginTop: "0.25rem" }}>
                  {activeConversation.audit_status}
                </span>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </PageShell>
  );
}
