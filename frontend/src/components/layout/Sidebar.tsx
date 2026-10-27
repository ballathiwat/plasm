// frontend/src/components/layout/Sidebar.tsx

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, LogOut } from "lucide-react";
import { MENU_ITEMS, type UserRole } from "../../types/navigation";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeModule: string;
  onNavigate: (key: string) => void;
  role: UserRole;
  onLogout?: () => void;
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  activeModule,
  onNavigate,
  role,
  onLogout,
}: SidebarProps) {
  const filteredMenu = MENU_ITEMS.filter((m) => m.roles.includes(role));

  // เปิด submenu อัตโนมัติถ้า activeModule อยู่ใน children
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(
    () => {
      const init: Record<string, boolean> = {};
      filteredMenu.forEach((item) => {
        if (item.children) {
          const childKeys = item.children.map((c) => c.key);
          if (childKeys.includes(activeModule)) {
            init[item.key] = true;
          }
        }
      });
      return init;
    },
  );

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuBtnStyle = (isActive: boolean): React.CSSProperties => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: collapsed ? "10px 0" : "10px 12px",
    justifyContent: collapsed ? "center" : "flex-start",
    borderRadius: "var(--radius-md, 8px)",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: isActive ? 600 : 400,
    color: "#fff",
    background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
    transition: "background 0.15s",
  });

  return (
    <aside
      className="hidden md:flex flex-col flex-none transition-all duration-150 ease-in-out overflow-hidden"
      style={{
        width: collapsed ? 68 : 240,
        background: "var(--primary)",
        backgroundImage: "url(/sidebar-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 10,
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex-none flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            P
          </div>
          {!collapsed && (
            <span
              style={{
                fontWeight: 700,
                fontSize: 17,
                color: "#fff",
                whiteSpace: "nowrap",
              }}
            >
              Plasm
            </span>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          aria-label="ย่อ/ขยายเมนู"
          style={{
            width: 24,
            height: 24,
            borderRadius: "var(--radius-sm)",
            background: "rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "none",
            flexShrink: 0,
            color: "#fff",
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: "8px 8px", overflowY: "auto" }}>
        {filteredMenu.map((item) => {
          const hasChildren = !!(item.children && item.children.length > 0);
          const isOpen = openSubmenus[item.key] ?? false;
          const isParentActive = !!(
            hasChildren && item.children!.some((c) => c.key === activeModule)
          );
          const isActive = !hasChildren && activeModule === item.key;
          const Icon = item.icon;

          if (hasChildren) {
            return (
              <div key={item.key}>
                {/* Parent button */}
                <button
                  onClick={() => {
                    if (collapsed) {
                      // collapsed → navigate ไป child ตัวแรก
                      onNavigate(item.children![0].key);
                    } else {
                      toggleSubmenu(item.key);
                    }
                  }}
                  title={collapsed ? item.label : undefined}
                  style={{
                    ...menuBtnStyle(isParentActive),
                    justifyContent: collapsed ? "center" : "space-between",
                  }}
                  onMouseEnter={(e) => {
                    if (!isParentActive)
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isParentActive)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <Icon size={20} style={{ flexShrink: 0, opacity: 0.85 }} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      size={14}
                      style={{
                        opacity: 0.6,
                        transition: "transform 0.2s",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  )}
                </button>

                {/* Children */}
                {!collapsed && isOpen && (
                  <div style={{ paddingLeft: 20, marginTop: 2 }}>
                    {item
                      .children!.filter((c) => c.roles.includes(role))
                      .map((child) => {
                        const isChildActive = activeModule === child.key;
                        const ChildIcon = child.icon;
                        return (
                          <button
                            key={child.key}
                            onClick={() => onNavigate(child.key)}
                            style={{
                              ...menuBtnStyle(isChildActive),
                              padding: "8px 12px",
                              fontSize: 13,
                            }}
                            onMouseEnter={(e) => {
                              if (!isChildActive)
                                e.currentTarget.style.background =
                                  "rgba(255,255,255,0.08)";
                            }}
                            onMouseLeave={(e) => {
                              if (!isChildActive)
                                e.currentTarget.style.background =
                                  "transparent";
                            }}
                          >
                            <ChildIcon
                              size={16}
                              style={{ flexShrink: 0, opacity: 0.75 }}
                            />
                            <span>{child.label}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          }

          // เมนูปกติ (ไม่มี children)
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              title={collapsed ? item.label : undefined}
              style={menuBtnStyle(isActive)}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon size={20} style={{ flexShrink: 0, opacity: 0.85 }} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      {onLogout && (
        <div style={{ padding: "8px 8px 16px" }}>
          <button
            onClick={onLogout}
            title={collapsed ? "ออกจากระบบ" : undefined}
            style={menuBtnStyle(false)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={20} style={{ flexShrink: 0, opacity: 0.85 }} />
            {!collapsed && <span>ออกจากระบบ</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
