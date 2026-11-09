// frontend/src/components/layout/NotificationBell.tsx — กระดิ่ง + dropdown 380px (มือถือ = bottom sheet)
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  BellOff,
  Pencil,
  XCircle,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import type { NotificationItem } from "../../helpers/useNotifications";

const KIND = {
  approve: { Icon: Pencil, fg: "#1D4ED8", bg: "#EFF6FF" },
  rejected: { Icon: XCircle, fg: "#DC2626", bg: "#FEF2F2" },
  approved: { Icon: CheckCircle, fg: "#16A34A", bg: "#F0FDF4" },
  lowstock: { Icon: AlertTriangle, fg: "#D97706", bg: "#FFFBEB" },
  info: { Icon: Bell, fg: "#71717A", bg: "#F4F4F5" },
} as const;

export function timeAgoTh(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "เมื่อสักครู่";
  if (s < 3600) return `${Math.floor(s / 60)} นาทีที่แล้ว`;
  if (s < 86400) return `${Math.floor(s / 3600)} ชั่วโมงที่แล้ว`;
  if (s < 604800) return `${Math.floor(s / 86400)} วันที่แล้ว`;
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
}

const useMobile = () => {
  const q = "(max-width: 768px)";
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const f = () => setM(mq.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return m;
};

function Item({ n, onClick }: { n: NotificationItem; onClick: () => void }) {
  const [h, setH] = useState(false);
  const k = KIND[n.kind] ?? KIND.info;
  return (
    <button
      role="menuitem"
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 12px",
        border: "none",
        borderRadius: 8,
        background: h
          ? "var(--surface-raised)"
          : n.read
            ? "transparent"
            : "rgba(37,99,235,0.04)",
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
        transition: "background 0.1s",
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: k.bg,
          color: k.fg,
        }}
      >
        <k.Icon size={16} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: n.read ? 500 : 600,
            color: "var(--text-primary)",
            lineHeight: "18px",
          }}
        >
          {n.title}
        </span>
        {n.detail && (
          <span
            style={{
              display: "block",
              fontSize: 12,
              color: "var(--text-secondary)",
              marginTop: 2,
              lineHeight: "17px",
            }}
          >
            {n.detail}
          </span>
        )}
        <span
          style={{
            display: "block",
            fontSize: 11,
            color: "var(--text-secondary)",
            marginTop: 4,
          }}
        >
          {timeAgoTh(n.at)}
        </span>
      </span>
      {!n.read && (
        <span
          aria-label="ยังไม่ได้อ่าน"
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--primary)",
            flexShrink: 0,
            marginTop: 6,
          }}
        />
      )}
    </button>
  );
}

interface Props {
  notifications: NotificationItem[];
  onItemClick?: (n: NotificationItem) => void;
  onMarkAllRead?: () => void;
  onViewAll?: () => void;
}

export default function NotificationBell({
  notifications,
  onItemClick,
  onMarkAllRead,
  onViewAll,
}: Props) {
  const mobile = useMobile();
  const [open, setOpen] = useState(false);
  const [h, setH] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (!mobile && ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fn);
      document.removeEventListener("keydown", esc);
    };
  }, [open, mobile]);

  const unread = notifications.filter((n) => !n.read).length;
  const action = notifications.filter((n) => n.group === "action");
  const info = notifications.filter((n) => n.group !== "action");
  const click = (n: NotificationItem) => {
    setOpen(false);
    onItemClick?.(n);
  };
  const head = (t: string, c = 0) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "10px 12px 4px",
        fontSize: 11,
        fontWeight: 700,
        color: "var(--text-secondary)",
        letterSpacing: "0.03em",
      }}
    >
      {t}
      {c > 0 && <span style={{ fontWeight: 600 }}>({c})</span>}
    </div>
  );

  const body = (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          การแจ้งเตือน
        </span>
        {unread > 0 && (
          <span
            style={{
              marginLeft: 8,
              fontSize: 12,
              color: "var(--text-secondary)",
            }}
          >
            ยังไม่อ่าน {unread}
          </span>
        )}
        {mobile && (
          <button
            aria-label="ปิด"
            onClick={() => setOpen(false)}
            style={{
              marginLeft: "auto",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              borderRadius: 8,
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>
      <div
        style={{
          overflowY: "auto",
          padding: "0 4px 4px",
          flex: 1,
          minHeight: 0,
        }}
      >
        {notifications.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <BellOff size={28} color="var(--text-secondary)" />
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              ไม่มีงานค้าง
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                marginTop: 2,
              }}
            >
              คุณดำเนินการครบแล้ว
            </div>
          </div>
        ) : (
          <>
            {action.length > 0 && (
              <>
                {head("ต้องดำเนินการ", action.length)}
                {action.map((n) => (
                  <Item key={n.id} n={n} onClick={() => click(n)} />
                ))}
              </>
            )}
            {info.length > 0 && (
              <>
                {head("แจ้งให้ทราบ")}
                {info.map((n) => (
                  <Item key={n.id} n={n} onClick={() => click(n)} />
                ))}
              </>
            )}
          </>
        )}
      </div>
      {notifications.length > 0 && (
        <div style={{ display: "flex", borderTop: "1px solid var(--border)" }}>
          <button
            onClick={() => onMarkAllRead?.()}
            disabled={!info.some((n) => !n.read)}
            style={{
              flex: 1,
              minHeight: 44,
              border: "none",
              background: "none",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 500,
              color: info.some((n) => !n.read)
                ? "var(--text-secondary)"
                : "var(--text-disabled)",
              cursor: "pointer",
            }}
          >
            อ่านทั้งหมดแล้ว
          </button>
          {onViewAll && (
            <button
              onClick={() => {
                setOpen(false);
                onViewAll();
              }}
              style={{
                flex: 1,
                minHeight: 44,
                border: "none",
                borderLeft: "1px solid var(--border)",
                background: "none",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--primary)",
                cursor: "pointer",
              }}
            >
              ดูทั้งหมด
            </button>
          )}
        </div>
      )}
    </>
  );

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          unread ? `การแจ้งเตือน ยังไม่อ่าน ${unread} รายการ` : "การแจ้งเตือน"
        }
        style={{
          position: "relative",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          borderRadius: "var(--radius-md, 8px)",
          background: h || open ? "var(--surface-raised)" : "none",
          color: "var(--text-secondary)",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              boxSizing: "border-box",
              borderRadius: 99,
              background: "#DC2626",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              lineHeight: "14px",
              textAlign: "center",
              border: "2px solid var(--surface)",
            }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && !mobile && (
        <div
          role="menu"
          aria-label="การแจ้งเตือน"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 6,
            width: 380,
            maxWidth: "calc(100vw - 24px)",
            maxHeight: 520,
            display: "flex",
            flexDirection: "column",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg, 12px)",
            boxShadow: "var(--shadow-md)",
            overflow: "hidden",
            animation: "plasm-fade-in 0.15s ease",
            zIndex: 60,
          }}
        >
          {body}
        </div>
      )}
      {open && mobile && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="การแจ้งเตือน"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              background: "var(--surface)",
              borderRadius: "16px 16px 0 0",
              boxShadow: "var(--shadow-md)",
              animation: "plasm-fade-in 0.2s ease",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 8,
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  background: "var(--border)",
                }}
              />
            </div>
            {body}
          </div>
        </div>
      )}
    </div>
  );
}
