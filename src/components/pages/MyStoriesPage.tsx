import { useState } from 'react';
import { Ico } from '../Icons';

export function MyStoriesPage({ user, stories, myChapters, openModal, show, onStory, deleteChapter }) {
    const [expandedStory, setExpandedStory] = useState(null);
    return (<div className="section fade-in">
      <div className="sec-head">
        <div><div className="sec-title">Tác phẩm của tôi</div><div className="sec-sub">Bút danh: <strong>{user.penName}</strong></div></div>
        <button className="btn-nav btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => openModal("submit-story")}><Ico.Plus />Đăng tác phẩm mới</button>
      </div>
      {stories.length === 0 ? (<div className="empty-state">Chưa có tác phẩm nào<p>Bắt đầu viết và đăng tác phẩm đầu tiên!</p>
          <button className="btn-nav btn-primary" style={{ margin: "20px auto", display: "flex", alignItems: "center", gap: 6 }} onClick={() => openModal("submit-story")}><Ico.Plus />Đăng tác phẩm</button>
        </div>) : (<div>
          {stories.map((s) => {
                const chs = myChapters[s.id];
                const isExpanded = expandedStory === s.id;
                return (<div key={s.id} className="pending-card" style={{ marginBottom: 16 }}>
                <div className="pending-card-header" style={{ cursor: "pointer" }} onClick={() => setExpandedStory(isExpanded ? null : s.id)}>
                  <div className="pending-cover" style={{ background: s.cover }}/>
                  <div className="hero-left">
                    <div className="pending-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {s.title}
                      <span className={`absolute left-[9px] top-[9px] rounded-[5px] px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.4px] ${s.status === "done" ? "badge-done" : s.status === "ongoing" ? "badge-ongoing" : "badge-pending"}`} style={{ position: "static", fontSize: 10 }}>{s.status === "done" ? "Hoàn thành" : s.status === "ongoing" ? "Đang ra" : "Chờ duyệt"}</span>
                    </div>
                    <div className="pending-author">{s.genre} · {chs.length} chương · {s.reads} lượt đọc</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button className="ch-manage-btn ch-edit-btn" onClick={e => { e.stopPropagation(); onStory(s); }}>👁 Xem</button>
                      <button className="ch-manage-btn ch-edit-btn" onClick={e => { e.stopPropagation(); setExpandedStory(isExpanded ? null : s.id); }}>📋 Quản lý chương</button>
                    </div>
                  </div>
                  <div style={{ color: "#9e8e82", marginLeft: 8 }}>{isExpanded ? <Ico.Back /> : <Ico.Next />}</div>
                </div>
                {isExpanded && (<div className="fade-in" style={{ padding: "0 18px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1c1512" }}>Danh sách chương ({chs.length})</div>
                      <button className="btn-approve" onClick={() => { openModal("add-chapter"); }}>+ Thêm chương</button>
                    </div>
                    {chs.map((ch) => (<div key={ch.id} className="chapter-item" style={{ marginBottom: 6 }}>
                        <div className="hero-left">
                          <div className="ch-title">{ch.title}</div>
                          <div className="ch-meta">{ch.words.toLocaleString()} chữ · {ch.readTime}{ch.publishedAt && ` · ${ch.publishedAt}`}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="ch-manage-btn ch-edit-btn"><Ico.Edit />Sửa</button>
                          <button className="ch-manage-btn ch-del-btn" onClick={() => deleteChapter(s.id, ch.id)}><Ico.Trash /></button>
                        </div>
                      </div>))}
                  </div>)}
              </div>);
            })}
        </div>)}
    </div>);
}