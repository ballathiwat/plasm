// frontend/src/pages/ExtBloodForm/components/ExtFormCommittee.tsx — เลือก หน้าที่ → ชื่อ (1 คนทำได้หลายหน้าที่)
import { useMemo, useState } from 'react'
import { Users, UserPlus, Trash2, CheckCircle2, Circle, AlertTriangle } from 'lucide-react'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import Button from '../../../components/common/Button'
import { ROLE_LABEL, ROLE_ORDER } from '../../ExtBlood/services/committeeHelpers'
import type { ExtCommitteeRole, UserSummary } from '../../ExtBlood/services/ExtBloodType'
import type { CommitteeDraft } from '../services/ExtFormType'

interface Props {
  productCode: string; committee: CommitteeDraft[]; setCommittee: (c: CommitteeDraft[]) => void
  users: UserSummary[]; suggestedRoles: ExtCommitteeRole[]; missingRoles: ExtCommitteeRole[]
}

export default function ExtFormCommittee({ productCode, committee, setCommittee, users, suggestedRoles, missingRoles }: Props) {
  const [role, setRole] = useState<OptionType | null>(null)
  const [user, setUser] = useState<OptionType | null>(null)
  const roleO = ROLE_ORDER.map((r) => ({ value: r, label: `${ROLE_LABEL[r]}${suggestedRoles.includes(r) ? '' : ' (ไม่บังคับ)'}` }))
  const userO = useMemo(() => users.filter((u) => !committee.some((m) => m.userId === u.id && m.role === role?.value)).map((u) => ({ value: u.id, label: u.name })), [users, committee, role])
  const sorted = [...committee].sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role))
  const add = () => {
    if (!role || !user) return
    setCommittee([...committee, { userId: user.value, userName: user.label, role: role.value as ExtCommitteeRole }])
    setUser(null)
  }

  return (
    <div className="ext-form-content">
      <h3 className="ext-form-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={16} /> คณะกรรมการ</h3>
      <div className="ext-cm-hint">
        <span className="ext-muted">ชนิด <b style={{ color: 'var(--text-primary)' }}>{productCode || '—'}</b> แนะนำให้มี:</span>
        {suggestedRoles.map((r) => {
          const ok = committee.some((m) => m.role === r)
          return <span key={r} className={`ext-cm-hint__role ${ok ? 'is-ok' : ''}`}>{ok ? <CheckCircle2 size={14} /> : <Circle size={14} />}{ROLE_LABEL[r]}</span>
        })}
        <span className="ext-muted" style={{ marginLeft: 'auto', fontSize: 12 }}>อนุมัติพร้อมกันได้ · 1 คนทำได้หลายหน้าที่</span>
      </div>

      <div className="ext-cm-add" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}>
        <SelectDropdown label="1. เลือกหน้าที่" placeholder="เลือกหน้าที่..." options={roleO} value={role} onChange={(v) => { setRole(v); setUser(null) }} isClearable={false} isSearchable={false} />
        <SelectDropdown label="2. เลือกชื่อ" placeholder={role ? 'เลือกรายชื่อ...' : 'เลือกหน้าที่ก่อน'} options={userO} value={user} onChange={setUser}
          isClearable={false} disabled={!role} noOptionsMessage="ทุกคนมีหน้าที่นี้แล้ว" />
        <Button icon={<UserPlus size={16} />} onClick={add} disabled={!role || !user}>เพิ่ม</Button>
      </div>

      {sorted.length === 0 ? (
        <div className="ext-cm-empty"><Users size={28} style={{ marginBottom: 6 }} /><div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>ยังไม่มีคณะกรรมการ</div>เลือกหน้าที่ แล้วเลือกชื่อ เพื่อเพิ่มรายชื่อ</div>
      ) : (
        <div className="ext-table-wrap">
          <table className="ext-table">
            <thead><tr><th style={{ width: 36 }}>#</th><th>หน้าที่</th><th>ชื่อ</th><th>สถานะ</th><th style={{ width: 90 }}>จัดการ</th></tr></thead>
            <tbody>{sorted.map((m, i) => (
              <tr key={`${m.userId}::${m.role}`}>
                <td className="ext-muted">{i + 1}</td>
                <td><span className={`ext-role-tag ext-role-tag--${m.role}`}>{ROLE_LABEL[m.role]}</span></td>
                <td>{m.userName}</td>
                <td><span className="ext-cm-status ext-cm-status--DRAFT">ยังไม่ส่ง</span></td>
                <td><Button variant="ghost" size="sm" icon={<Trash2 size={14} />} aria-label={`ลบ ${m.userName}`} onClick={() => setCommittee(committee.filter((x) => !(x.userId === m.userId && x.role === m.role)))}>ลบ</Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {committee.length > 0 && missingRoles.length > 0 && (
        <div className="ext-cm-warn"><AlertTriangle size={14} />ไม่มี {missingRoles.map((r) => ROLE_LABEL[r]).join(', ')} — ส่งได้ แต่ตรวจสอบให้แน่ใจ</div>
      )}
    </div>
  )
}
