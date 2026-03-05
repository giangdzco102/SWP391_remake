import React, { useState, useEffect } from "react";
import { Ico } from "../Icons";
import { StarRating, AvatarComp, Toast } from "../ui";
export function EditorDashboard({
  user,
  tasks,
  editorTab,
  setEditorTab,
  onClaim,
  onComplete,
}) {
  const openTasks = tasks.filter((t) => t.status === "open");
  const myTasks = tasks.filter(
    (t) => t.status === "claimed" && t.claimedBy === user.name,
  );
  const doneTasks = tasks.filter((t) => t.status === "done");
  return (
    <div className="reviewer-dash fade-in">
      <div className="dash-header editor-h">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div className="dash-title">✏ Bảng Editor</div>
            <div className="dash-sub">
              Nhận nhiệm vụ, hoàn thành và nhận coin thưởng!
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <div
              className="role-chip chip-editor"
              style={{ fontSize: 12, padding: "5px 14px" }}
            >
              <Ico.Edit />
              Editor
            </div>
            <div className="coin-badge">🪙 {user.coins} coin</div>
          </div>
        </div>
        <div className="dash-stats" style={{ marginTop: 20 }}>
          {[
            ["Nhiệm vụ mở", openTasks.length],
            ["Đang làm", myTasks.length],
            ["Hoàn thành", doneTasks.length],
            ["Coin kiếm", user.coins],
          ].map(([l, v]) => (
            <div key={l} className="dash-stat">
              <div
                className="dash-stat-num"
                style={{ color: l === "Coin kiếm" ? "#fcd34d" : undefined }}
              >
                {v}
              </div>
              <div className="dash-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-[10px] border-[1.5px] border-[#86efac] bg-[#f0fdf4] px-4 py-3.5 text-[13px] leading-[1.6] text-[#166534]"
        style={{ marginBottom: 20 }}
      >
        <strong>✏ Editor là gì?</strong> Hỗ trợ tác giả:{" "}
        <strong>sửa bản thảo</strong> (chính tả, văn phong) hoặc{" "}
        <strong>viết thêm chapter</strong> theo yêu cầu. Mỗi nhiệm vụ hoàn thành
        nhận coin thưởng ngay.
      </div>

      <div className="dash-tabs">
        {[
          { id: "open", label: `🔓 Mở (${openTasks.length})` },
          { id: "mine", label: `⚙ Đang làm (${myTasks.length})` },
          { id: "done", label: `✓ Xong (${doneTasks.length})` },
        ].map((t) => (
          <button
            key={t.id}
            className={`dash-tab${editorTab === t.id ? " active-green active" : ""}`}
            onClick={() => setEditorTab(t.id)}
            style={
              editorTab === t.id
                ? { background: "#1d6b3a", color: "#fff" }
                : undefined
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {editorTab === "open" &&
        (openTasks.length === 0 ? (
          <div className="empty-state">
            Không có nhiệm vụ mở<p>Quay lại sau!</p>
          </div>
        ) : (
          openTasks.map((task) => (
            <div key={task.id} className="editor-task-card fade-in">
              <div className="pending-card-header">
                <div
                  className="pending-cover"
                  style={{ background: task.cover }}
                />
                <div className="hero-left">
                  <div
                    className={`task-type-badge ${task.type === "edit" ? "badge-edit-task" : "badge-chapter-task"}`}
                  >
                    {task.type === "edit"
                      ? "✏ Sửa bản thảo"
                      : "📝 Viết chapter"}
                  </div>
                  <div className="task-title">{task.title}</div>
                  <div className="task-desc">{task.description}</div>
                  <div className="task-meta-row">
                    <span>📖 {task.genre}</span>
                    <span>📊 ~{task.wordCount.toLocaleString()} chữ</span>
                    <span>⏰ Deadline: {task.deadline}</span>
                  </div>
                </div>
              </div>
              <div className="task-actions">
                <div className="task-reward">
                  🪙 +{task.reward} coin khi hoàn thành
                </div>
                <button className="btn-claim" onClick={() => onClaim(task.id)}>
                  Nhận nhiệm vụ
                </button>
              </div>
            </div>
          ))
        ))}

      {editorTab === "mine" &&
        (myTasks.length === 0 ? (
          <div className="empty-state">
            Chưa có nhiệm vụ đang làm
            <p>Nhận nhiệm vụ từ tab `&quot;`Mở`&quot;`.</p>
          </div>
        ) : (
          myTasks.map((task) => (
            <div key={task.id} className="editor-task-card fade-in">
              <div className="pending-card-header">
                <div
                  className="pending-cover"
                  style={{ background: task.cover }}
                />
                <div className="hero-left">
                  <div
                    className={`task-type-badge ${task.type === "edit" ? "badge-edit-task" : "badge-chapter-task"}`}
                  >
                    {task.type === "edit"
                      ? "✏ Sửa bản thảo"
                      : "📝 Viết chapter"}
                  </div>
                  <div className="task-title">{task.title}</div>
                  <div className="task-desc">{task.description}</div>
                  <div className="task-meta-row">
                    <span>⏰ Deadline: {task.deadline}</span>
                    <span style={{ color: "#1d6b3a", fontWeight: 700 }}>
                      Đang thực hiện
                    </span>
                  </div>
                </div>
              </div>
              <div className="task-actions">
                <div className="task-reward">
                  🪙 +{task.reward} coin khi hoàn thành
                </div>
                <button
                  className="btn-approve"
                  onClick={() => onComplete(task.id)}
                >
                  <Ico.Check />
                  Nộp bài &amp; nhận coin
                </button>
              </div>
            </div>
          ))
        ))}

      {editorTab === "done" &&
        (doneTasks.length === 0 ? (
          <div className="empty-state">Chưa hoàn thành nhiệm vụ</div>
        ) : (
          doneTasks.map((task) => (
            <div key={task.id} className="editor-task-card">
              <div className="pending-card-header">
                <div
                  className="pending-cover"
                  style={{ background: task.cover }}
                />
                <div className="hero-left">
                  <div className="task-title">
                    {task.title}
                    <span className="ml-2 inline-flex items-center gap-1 rounded-xl px-2.5 py-[3px] text-[11px] font-bold chip-ok">
                      ✓ Xong
                    </span>
                  </div>
                  <div className="task-desc">{task.description}</div>
                  <div className="task-reward" style={{ marginTop: 6 }}>
                    🪙 +{task.reward} coin đã nhận
                    {task.completedAt && ` · ${task.completedAt}`}
                  </div>
                </div>
              </div>
            </div>
          ))
        ))}
    </div>
  );
}
