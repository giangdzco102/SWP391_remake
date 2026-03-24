const fs = require('fs');

const file = 'd:/FU_Learning/Semester5/SWP301/SWP391_remake/app/myStoriesPage/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add EditRequest Interface
if (!content.includes('interface EditRequest {')) {
  const insertType = 
interface EditRequest {
  id: number;
  chapterId: number;
  chapterTitle: string;
  storyTitle: string;
  authorId: number;
  authorName: string;
  editorId?: number;
  editorName?: string;
  coinReward: number;
  description?: string;
  editedContent?: string;
  editorNote?: string;
  authorNote?: string;
  status: "OPEN" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "CANCELLED";
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
}
  ;
  content = content.replace('// ── Types ─────────────────────────────────────────────────────────────────', '// ── Types ─────────────────────────────────────────────────────────────────\n' + insertType);
}

// 2. Add AuthorReviewEditModal before MyStoriesPage
if (!content.includes('function AuthorReviewEditModal')) {
  const modalComp = 
function AuthorReviewEditModal({ request, onClose, onAction }: { request: EditRequest; onClose: () => void; onAction: (reqId: number, isApprove: boolean, note: string) => Promise<void> }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleApprove = async () => {
    setSaving(true);
    await onAction(request.id, true, note);
    setSaving(false);
  };
  const handleReject = async () => {
    if (!note.trim()) {
      alert("Vui lòng nhập lý do từ chối (Ghi chú) để Editor biết đường sửa lại!");
      return;
    }
    setSaving(true);
    await onAction(request.id, false, note);
    setSaving(false);
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 860, maxHeight: "94vh", display: "flex", flexDirection: "column", boxShadow: "0 16px 48px rgba(0,0,0,0.24)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px 12px", borderBottom: "1.5px solid #f0e8e0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 800, color: "#1c1512" }}>Bản phân tích chỉnh sửa</div>
            <div style={{ fontSize: 12, color: "#b0a096", marginTop: 2 }}>{request.chapterTitle} · Biên tập: {request.editorName}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #e8e0d6", background: "#fdfaf7", cursor: "pointer", fontSize: 16, color: "#6b5a4e", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {request.editorNote && (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#166534" }}>
              <strong>�� Editor ghi chú:</strong> {request.editorNote}
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b5a4e", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Nội dung đã chỉnh sửa đính kèm:</label>
            <div style={{ padding: "16px", background: "#fdfaf7", border: "1.5px solid #e8e0d6", borderRadius: 10, fontSize: 14, color: "#1c1512", lineHeight: 1.8, minHeight: 200, whiteSpace: "pre-wrap" }}>
              {request.editedContent}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b5a4e", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Phản hồi của bạn (Ghi chú)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập nhận xét / lý do từ chối nếu có..."
              rows={3}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e8e0d6", fontSize: 14, color: "#1c1512", fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "10px 22px", borderRadius: 9, border: "1.5px solid #e8e0d6", background: "#fff", color: "#6b5a4e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Đóng</button>
            <button onClick={handleReject} disabled={saving} style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: "#c23d3f", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>✕ Yêu cầu sửa lại</button>
            <button onClick={handleApprove} disabled={saving} style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: "#16a34a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>✓ Chấp nhận bản này</button>
          </div>
        </div>
      </div>
    </div>
  );
}
  ;
  content = content.replace('// ── Main Page ─────────────────────────────────────────────────────────────', modalComp + '\n// ── Main Page ─────────────────────────────────────────────────────────────');
}

// 3. Update main page hook vars
if (!content.includes('const [tab, setTab] = useState')) {
  // Add tabs
  const insertState = 
  const [tab, setTab] = useState<"stories" | "editRequests">("stories");
  const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [reviewEditModal, setReviewEditModal] = useState<EditRequest | null>(null);

  const loadEditRequests = async () => {
    setLoadingRequests(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.EDIT_REQUEST.MY);
      const list = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setEditRequests(Array.isArray(list) ? list : []);
    } catch {
      setEditRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (tab === "editRequests" && editRequests.length === 0) {
      loadEditRequests();
    }
  }, [tab]);

  const handleActionEditReq = async (reqId: number, isApprove: boolean, note: string) => {
    try {
      const endpoint = isApprove ? APP_CONFIG.EDIT_REQUEST.APPROVE(reqId) : APP_CONFIG.EDIT_REQUEST.REJECT(reqId);
      await httpClient.post(endpoint, { note: note || undefined });
      toast.success(isApprove ? "Đã duyệt bản chỉnh sửa!" : "Đã từ chối bản chỉnh sửa, gửi lại cho editor!");
      setReviewEditModal(null);
      loadEditRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Lỗi cập nhật yêu cầu");
    }
  };

  const handleCancelEditReq = async (reqId: number) => {
    if(!window.confirm("Bạn có chắc muốn huỷ yêu cầu này? Coin sẽ được hoàn lại.")) return;
    try {
      await httpClient.post(APP_CONFIG.EDIT_REQUEST.CANCEL(reqId), {});
      toast.success("Đã huỷ yêu cầu chỉnh sửa thành công!");
      loadEditRequests();
    } catch {
      toast.error("Không thể huỷ yêu cầu lúc này.");
    }
  };
  ;
  content = content.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n' + insertState);
}

// 4. Update UI Tabs Header
if (!content.includes('TABS.map((t)')) {
  const insertTabs = 
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginTop: 20, overflowX: "auto" }}>
            {[
              { id: "stories", label: "Tác phẩm của tôi" },
              { id: "editRequests", label: "Yêu cầu biên tập" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                style={{
                  flex: 1, minWidth: 140, padding: "10px 18px", borderRadius: "8px 8px 0 0",
                  border: "none", background: tab === t.id ? "#fff" : "rgba(255,255,255,0.18)",
                  color: tab === t.id ? "#ff500a" : "#fff", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", opacity: tab === t.id ? 1 : 0.8
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
  ;
  content = content.replace('</div>\n      </div>\n\n      {/* ── Content ── */}', insertTabs + '</div>\n      </div>\n\n      {/* ── Content ── */}');
}

// 5. Wrap UI Content and Add EditReqs render logic
if (!content.includes('tab === "stories" &&')) {
  content = content.replace('{stories.length === 0 ? (', '{tab === "stories" && (stories.length === 0 ? (');
  content = content.replace('</div>\n            );\n          })}\n        </div>\n      )}', '</div>\n            );\n          })}\n        </div>\n      ))}\n\n');

  const insertEditReqUI = 
      {tab === "editRequests" && (
        <div>
          {loadingRequests ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9e8e82" }}>⏳ Đang tải yêu cầu...</div>
          ) : editRequests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#b0a096", background: "#fff", borderRadius: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Chưa có yêu cầu làm việc cùng Editor</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Hãy vào danh sách chương và chọn "Đặt chỉnh sửa".</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {editRequests.map((req) => (
                <div key={req.id} style={{ background: "#fff", border: "1.5px solid #e8e0d6", borderRadius: 16, padding: "18px 20px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <h4 style={{ margin: 0, fontSize: 16, color: "#1c1512" }}>{req.chapterTitle}</h4>
                        <span style={{ fontSize: 11, background: "#f0ebe6", padding: "3px 8px", borderRadius: 12, fontWeight: 600 }}>🪙 {req.coinReward} xu</span>
                        <span style={{ fontSize: 11, background: req.status === "SUBMITTED" ? "#dcfce7" : req.status === "IN_PROGRESS" ? "#fef3c7" : "#e0f2fe", color: req.status === "SUBMITTED" ? "#166534" : req.status === "IN_PROGRESS" ? "#92400e" : "#0369a1", padding: "3px 8px", borderRadius: 12, fontWeight: 700 }}>
                          {req.status === "OPEN" ? "Đang chờ Editor" : req.status === "IN_PROGRESS" ? "Editor Đang Làm" : req.status === "SUBMITTED" ? "Chờ duyệt" : req.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "#9e8e82" }}>
                        Bởi Editor: <strong>{req.editorName || "Chưa có"}</strong> · Kéo dài từ {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {req.status === "OPEN" && (
                        <button onClick={() => handleCancelEditReq(req.id)} style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e8e0d6", background: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Huỷ yêu cầu</button>
                      )}
                      {req.status === "SUBMITTED" && (
                        <button onClick={() => setReviewEditModal(req)} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#ff500a", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>👁 Kiểm tra & Duyệt</button>
                      )}
                      {req.status === "APPROVED" && (
                        <span style={{ fontSize: 13, color: "#166534", fontWeight: 700 }}>✅ Hoàn thành</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
  ;
  content = content.replace('</div>\n\n      {/* Modals */}', insertEditReqUI + '\n      </div>\n\n      {/* Modals */}');
  
  const insertModalFooter = 
      {reviewEditModal && (
        <AuthorReviewEditModal
          request={reviewEditModal}
          onClose={() => setReviewEditModal(null)}
          onAction={handleActionEditReq}
        />
      )}
  ;
  content = content.replace('</div>\n  );\n}', insertModalFooter + '\n    </div>\n  );\n}');
}

fs.writeFileSync(file, content);
console.log('Update Author OK!');
