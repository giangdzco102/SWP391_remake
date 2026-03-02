import React, { useState, useEffect, useRef, useCallback } from 'react';

export function AvatarCropModal({ user, show, onClose }: any) {
    const [step, setStep] = useState("drop");
    const [imageSrc, setImageSrc] = useState(null);
    const [scale, setScale] = useState(1);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, ox: 0, oy: 0 });
    const [isDragOver, setIsDragOver] = useState(false);
    
    const fileInputRef = useRef(null);
    const previewRef = useRef(null);
    const imgRef = useRef(null);

    const loadFile = (file) => {
        if (!file.type.startsWith('image/')) {
            show('Vui lòng chọn file ảnh (JPG, PNG, GIF...)', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            show('Ảnh quá lớn! Tối đa 5MB.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = e => { 
            setImageSrc(e.target?.result); 
            setStep('crop'); 
            setScale(1); 
            setOffsetX(0); 
            setOffsetY(0); 
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) loadFile(file);
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY });
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        setOffsetX(dragStart.ox + (e.clientX - dragStart.x));
        setOffsetY(dragStart.oy + (e.clientY - dragStart.y));
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => { 
            window.removeEventListener('mousemove', handleMouseMove); 
            window.removeEventListener('mouseup', handleMouseUp); 
        };
    }, [handleMouseMove, handleMouseUp]);

    const handleSave = () => {
        if (!imageSrc || !imgRef.current) return;
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();

        const img = imgRef.current;
        const naturalW = img.naturalWidth, naturalH = img.naturalHeight;
        const displaySize = 240;
        const baseScale = displaySize / Math.min(naturalW, naturalH);
        const totalScale = baseScale * scale;
        
        const centerX = displaySize / 2 + offsetX;
        const centerY = displaySize / 2 + offsetY;
        
        const sx = (centerX - size / 2) / totalScale;
        const sy = (centerY - size / 2) / totalScale;
        const sw = size / totalScale;
        const sh = size / totalScale;

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // setUser((u) => ({ ...u, avatarUrl: dataUrl }));
        show('🎉 Cập nhật ảnh đại diện thành công!', 'success');
        onClose();
    };

    const handleRemove = () => {
        // setUser((u) => ({ ...u, avatarUrl: undefined }));
        show('Đã xóa ảnh đại diện.', 'info');
        onClose();
    };

    return (
        <div className="avatar-crop-modal" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="avatar-crop-box">
                <div className="avatar-crop-title">📷 Cập nhật ảnh đại diện</div>
                <div className="avatar-crop-sub">
                    {step === "drop" ? "Tải lên ảnh từ thiết bị của bạn" : "Điều chỉnh ảnh — kéo để di chuyển, dùng thanh trượt để zoom"}
                </div>

                {step === "drop" && (
                    <div>
                        <div 
                            className={`avatar-drop-zone${isDragOver ? " drag-over" : ""}`} 
                            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }} 
                            onDragLeave={() => setIsDragOver(false)} 
                            onDrop={handleDrop} 
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="avatar-drop-icon">🖼️</div>
                            <div className="avatar-drop-text">Kéo thả ảnh vào đây</div>
                            <div className="avatar-drop-sub">hoặc click để chọn file · JPG, PNG, GIF · tối đa 5MB</div>
                        </div>
                        <input 
                            ref={fileInputRef} 
                            type="file" 
                            accept="image/*" 
                            style={{ display: "none" }} 
                            onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); }}
                        />
                        {user.avatarUrl && (
                            <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                                <button onClick={handleRemove} className="btn-full" style={{ padding: "8px 20px", borderRadius: 8, border: "1.5px solid #f87171", background: "#fde8e8", color: "#c23d3f", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "auto" }}>
                                    🗑 Xóa ảnh hiện tại
                                </button>
                            </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                            <button onClick={onClose} className="btn-nav btn-ghost" style={{ padding: "9px 20px", borderRadius: 9, fontSize: 13, fontWeight: 600 }}>Hủy</button>
                        </div>
                    </div>
                )}

                {step === "crop" && imageSrc && (
                    <div>
                        <div ref={previewRef} className="avatar-preview-area" onMouseDown={handleMouseDown} style={{ cursor: isDragging ? "grabbing" : "grab" }}>
                            <img 
                                ref={imgRef} 
                                src={imageSrc} 
                                alt="preview" 
                                style={{
                                    position: "absolute",
                                    width: `${240 * scale}px`,
                                    height: `${240 * scale}px`,
                                    objectFit: "cover",
                                    left: "50%", 
                                    top: "50%",
                                    transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
                                    userSelect: "none",
                                    pointerEvents: "none",
                                }}
                            />
                            <div style={{ position: "absolute", inset: 0, border: "3px solid rgba(255,255,255,.6)", borderRadius: "50%", pointerEvents: "none", boxShadow: "0 0 0 9999px rgba(0,0,0,.45)" }}/>
                        </div>
                        <div className="avatar-crop-controls">
                            <div>
                                <label className="avatar-crop-label">🔍 Zoom: {Math.round(scale * 100)}%</label>
                                <input 
                                    type="range" 
                                    className="avatar-range" 
                                    min="0.5" 
                                    max="3" 
                                    step="0.05" 
                                    value={scale} 
                                    style={{ "--val": `${((scale - 0.5) / 2.5) * 100}%` } as React.CSSProperties} 
                                    onChange={e => setScale(parseFloat(e.target.value))}
                                />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={() => { setStep("drop"); setImageSrc(null); }} className="btn-nav btn-ghost" style={{ padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600 }}>← Chọn lại</button>
                            <button onClick={onClose} className="btn-nav btn-ghost" style={{ padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600 }}>Hủy</button>
                            <button onClick={handleSave} className="btn-hero btn-hero-primary" style={{ padding: "9px 22px", borderRadius: 9, fontSize: 13, fontWeight: 700 }}>✓ Lưu ảnh</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}