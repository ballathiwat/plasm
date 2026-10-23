// ============================================================
//  src/pages/settings/index.tsx
// ============================================================

import { CheckCircle2, AlertCircle, X } from "lucide-react";
import useSettings from "./services/useSettings";
import useMasterData from "./services/useMasterData";
import SettingsMinStock from "./components/SettingsMinStock";
import SettingsUsers from "./components/SettingsUsers";
import SettingsCodeList from "./components/SettingsCodeList";
import SettingsZones from "./components/SettingsZones";

const TABS = [
  { key: "stock" as const, label: "ค่าขั้นต่ำ" },
  { key: "users" as const, label: "จัดการผู้ใช้" },
  { key: "plasma" as const, label: "ชนิดพลาสมา" },
  { key: "blood" as const, label: "หมู่เลือด" },
  { key: "zones" as const, label: "สถานที่จัดเก็บ" },
];

const SettingsPage = () => {
  const {
    activeTab,
    setActiveTab,
    minimumStock,
    savingSettings,
    handleMinStockChange,
    handleSaveMinimumStock,
    users,
    loadingUsers,
    showUserForm,
    setShowUserForm,
    userForm,
    savingUser,
    handleUserFormChange,
    handleCreateUser,
    handleToggleActive,
    toast,
    dismissToast,
    notify,
  } = useSettings();

  const master = useMasterData(notify);

  return (
    <div style={{ animation: "plasm-fade-in 0.2s ease" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: "var(--radius-md, 8px)",
            background: toast.type === "success" ? "#F0FDF4" : "#FEF2F2",
            border: `1px solid ${toast.type === "success" ? "#BBF7D0" : "#FECACA"}`,
            color: toast.type === "success" ? "#166534" : "#991B1B",
            fontSize: 13,
            fontWeight: 500,
            boxShadow: "var(--shadow-md)",
            animation: "plasm-fade-in 0.2s ease",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {toast.msg}
          <button
            onClick={dismissToast}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              marginLeft: 8,
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>ตั้งค่า</h2>
        <p
          style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}
        >
          กำหนดค่าขั้นต่ำสต็อก จัดการผู้ใช้ และข้อมูลหลักของระบบ
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 20,
          borderBottom: "2px solid var(--border, #E4E4E7)",
          overflowX: "auto",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px",
              whiteSpace: "nowrap",
              border: "none",
              background: "transparent",
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 700 : 500,
              color:
                activeTab === tab.key
                  ? "var(--primary, #2563EB)"
                  : "var(--text-secondary)",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid var(--primary, #2563EB)"
                  : "2px solid transparent",
              marginBottom: -2,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "stock" && (
        <SettingsMinStock
          groups={master.bloodTypes.filter((b) => b.active).map((b) => b.code)}
          minimumStock={minimumStock}
          saving={savingSettings}
          loading={master.loading}
          onChange={handleMinStockChange}
          onSave={handleSaveMinimumStock}
        />
      )}

      {activeTab === "users" && (
        <SettingsUsers
          users={users}
          loading={loadingUsers}
          showForm={showUserForm}
          form={userForm}
          saving={savingUser}
          onToggleForm={setShowUserForm}
          onFormChange={handleUserFormChange}
          onCreate={handleCreateUser}
          onToggleActive={handleToggleActive}
        />
      )}

      {activeTab === "plasma" && (
        <SettingsCodeList
          title="ชนิดพลาสมา"
          description="เช่น FFP, Cryo, IFFP"
          placeholder="ชื่อชนิดใหม่"
          items={master.plasmaTypes}
          loading={master.loading}
          onAdd={(code) => master.addCode("plasma", code)}
          onToggle={(it) => master.toggleCode("plasma", it)}
        />
      )}

      {activeTab === "blood" && (
        <SettingsCodeList
          title="หมู่เลือด"
          description="เช่น A, B, O, AB, A-"
          placeholder="หมู่เลือดใหม่"
          items={master.bloodTypes}
          loading={master.loading}
          onAdd={(code) => master.addCode("blood", code)}
          onToggle={(it) => master.toggleCode("blood", it)}
        />
      )}

      {activeTab === "zones" && (
        <SettingsZones
          zones={master.zones}
          loading={master.loading}
          onAddZone={master.addZone}
          onToggleZone={master.toggleZone}
          onAddShelf={master.addShelf}
          onToggleShelf={master.toggleShelf}
        />
      )}
    </div>
  );
};

export default SettingsPage;
