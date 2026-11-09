// frontend/src/pages/ExtBloodForm/index.tsx — 2 ขั้น: ข้อมูลและถุงเลือด → คณะกรรมการอนุมัติ
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertTriangle, FileText, ScanBarcode, Paperclip, Check, ChevronRight, Save, Pencil, ClipboardCheck } from 'lucide-react'
import Button from '../../components/common/Button'
import { ConfirmModal } from '../../components/common/Modal'
import useExtForm from './services/useExtForm'
import ExtFormStepBar from './components/ExtFormStepBar'
import ExtFormReceiveInfo from './components/ExtFormReceiveInfo'
import ExtFormBagInput from './components/ExtFormBagInput'
import ExtFormAttachments from './components/ExtFormAttachments'
import ExtFormCommittee from './components/ExtFormCommittee'
import ExtFormFooter from './components/ExtFormFooter'
import ExtFormSummary from './components/ExtFormSummary'
import { ROLE_LABEL } from '../ExtBlood/services/committeeHelpers'
import { formatThaiDate } from '../ExtBlood/services/extHelpers'
import '../../assets/styles/ext-blood-form.css'
import '../../assets/styles/ext-committee.css'

function TL({ icon, title, done, hint, aside, last, children }: { icon: ReactNode; title: string; done: boolean; hint: string; aside?: ReactNode; last?: boolean; children: ReactNode }) {
  return (
    <section className={`ext-tl ${done ? 'is-done' : ''}`} aria-label={`${title} — ${done ? 'ครบแล้ว' : 'ยังไม่ครบ'}`}>
      <div className="ext-tl__rail"><span className="ext-tl__dot">{done ? <Check size={16} strokeWidth={3} /> : icon}</span>{!last && <span className="ext-tl__line" />}</div>
      <div style={{ minWidth: 0 }}>
        <div className="ext-tl__head"><span className="ext-tl__title">{title}</span><span className="ext-tl__hint">{hint}</span>{aside && <span className="ext-tl__aside">{aside}</span>}</div>
        {children}
      </div>
    </section>
  )
}

export default function ExtBloodFormPage() {
  const navigate = useNavigate()
  const h = useExtForm()
  const [leave, setLeave] = useState(false)
  const [confirmSend, setConfirmSend] = useState(false)
  if (h.loading) return <div className="ext-form-loading"><Loader2 size={32} className="ext-spin" color="var(--primary)" /></div>

  const back = () => (h.dirty ? setLeave(true) : navigate('/ext-blood'))
  const infoDone = h.infoLeft === 0 && !!h.form.receivedDate
  const parts = [infoDone, h.form.bags.length > 0, h.attachments.length > 0]
  const sourceName = h.sources.find((s) => s.id === h.form.sourceId)?.name
  const storageName = h.storages.find((s) => s.id === h.form.storageId)?.name
  const boxLabel = h.form.boxLabel || h.nextLabel
  const trySubmit = () => (h.missingRoles.length ? setConfirmSend(true) : h.submit())

  return (
    <div className={`ext-form-page${h.step === 2 ? ' ext-form-page--review' : ''}`} style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <ConfirmModal open={leave} type="danger" title="ออกจากหน้านี้?" message="ข้อมูลที่กรอกและถุงที่สแกนไว้จะหายไป หากต้องการเก็บไว้ ให้กด บันทึกร่าง ก่อน"
        confirmText="ออกโดยไม่บันทึก" cancelText="อยู่ต่อ" onClose={() => setLeave(false)} onConfirm={() => navigate('/ext-blood')} />
      <ConfirmModal open={confirmSend} type="warning" title="คณะกรรมการยังไม่ครบตามที่แนะนำ"
        message={`ไม่มี ${h.missingRoles.map((r) => ROLE_LABEL[r]).join(', ')} — ยืนยันส่งให้คณะกรรมการ ${h.committee.length} คนหรือไม่?`}
        confirmText="ยืนยันส่ง" cancelText="กลับไปเพิ่มรายชื่อ" onClose={() => setConfirmSend(false)} onConfirm={() => { setConfirmSend(false); h.submit() }} />

      <div className="ext-form-header">
        <button className="ext-back-btn" onClick={back} aria-label="กลับไปหน้ารายการ"><ArrowLeft size={18} /></button>
        <div>
          <h2 className="ext-title">{h.isEdit ? 'แก้ไขเอกสาร' : 'บันทึกรับเลือดจากภายนอก'}</h2>
          <p className="ext-subtitle">{h.existingDoc ? h.existingDoc.docNumber : 'กรอกข้อมูลตามใบนำส่ง แล้วสแกนถุงให้ครบ'}</p>
        </div>
      </div>

      <ExtFormStepBar step={h.step} valid1={h.valid1} onStepClick={h.setStep} />

      {h.tried && !h.valid1 && h.step === 1 && (
        <div className="ext-form-error" role="alert" style={{ marginBottom: 16 }}><AlertTriangle size={14} /> ยังไม่ครบ: {Object.values(h.errors).filter(Boolean).join(' · ')}</div>
      )}
      {h.error && <div className="ext-form-error" role="alert" style={{ marginBottom: 16 }}><AlertTriangle size={14} /> {h.error}</div>}

      {h.step === 1 && (
        <div className="ext-form-layout">
          <div style={{ minWidth: 0 }}>
            <TL icon={<FileText size={16} />} title="ข้อมูลการรับ" done={infoDone} hint={infoDone ? 'ครบแล้ว' : `เหลือ ${h.infoLeft} ช่อง`}
              aside={boxLabel && <>หมายเลขกล่อง <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{boxLabel}</b></>}>
              <div className="ext-form-content">
                <ExtFormReceiveInfo form={h.form} setField={h.setField} sources={h.sources} storages={h.storages} nextLabel={h.nextLabel}
                  errors={h.tried ? { plasmaType: h.errors.plasmaType, bloodGroup: h.errors.bloodGroup } : {}} />
              </div>
            </TL>
            <TL icon={<ScanBarcode size={16} />} title="สแกนถุงเลือด" done={h.form.bags.length > 0} hint={h.form.bags.length ? `${h.form.bags.length} ถุง` : 'สแกนอย่างน้อย 1 ถุง'}>
              <div className="ext-form-content">
                <ExtFormBagInput bags={h.form.bags} bagInput={h.bagInput} setBagInput={h.setBagInput} addBag={h.addBag} removeBag={h.removeBag} bagError={h.bagError} />
              </div>
            </TL>
            <TL icon={<Paperclip size={16} />} title="ไฟล์แนบ" done={h.attachments.length > 0} hint={h.attachments.length ? `${h.attachments.length} ไฟล์` : 'ไม่บังคับ'} last>
              <div className="ext-form-content">
                <ExtFormAttachments attachments={h.attachments} onAdd={h.addAttachments} onRemove={h.removeAttachment} />
              </div>
            </TL>
          </div>
          <div className="ext-form-aside">
            <ExtFormSummary parts={parts} date={h.form.receivedDate} source={sourceName} product={h.form.plasmaType} bloodGroup={h.form.bloodGroup}
              storage={storageName} boxLabel={boxLabel} bags={h.form.bags} files={h.attachments.length}
              actions={<>
                <Button block iconRight={<ChevronRight size={16} />} onClick={() => h.setStep(2)}>ถัดไป: เลือกคณะกรรมการ</Button>
                <Button block variant="ghost" icon={<Save size={16} />} onClick={h.saveDraft} loading={h.saving === 'draft'} disabled={!!h.saving}>บันทึกร่าง</Button>
              </>} />
          </div>
        </div>
      )}

      {h.step === 2 && (
        <div style={{ maxWidth: 820 }}>
          <div className="ext-form-content">
            <h3 className="ext-form-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardCheck size={16} /> ตรวจทานข้อมูล
              <Button variant="ghost" size="sm" icon={<Pencil size={14} />} style={{ marginLeft: 'auto' }} onClick={() => h.setStep(1)}>แก้ไข</Button>
            </h3>
            <div className="ext-review-grid">
              {[['วันที่รับ', formatThaiDate(h.form.receivedDate)], ['สถานที่ส่ง', sourceName], ['ชนิด / หมู่เลือด', `${h.form.plasmaType} · ${h.form.bloodGroup}`],
                ['ตำแหน่งจัดเก็บ', storageName], ['หมายเลขกล่อง', boxLabel], ['ถุงเลือด', `${h.form.bags.length} ถุง`], ['ไฟล์แนบ', h.attachments.length ? `${h.attachments.length} ไฟล์` : '—']]
                .map(([k, v]) => <div key={k} className="ext-detail-row"><span className="ext-detail-label">{k}</span><span className="ext-detail-value">{v || '—'}</span></div>)}
            </div>
          </div>
          <ExtFormCommittee productCode={h.form.plasmaType} committee={h.committee} setCommittee={h.setCommittee} users={h.users}
            suggestedRoles={h.suggestedRoles} missingRoles={h.missingRoles} />
          <p className="ext-muted" style={{ fontSize: 12, margin: '0 0 8px' }}>กดส่งแล้ว เอกสารจะบันทึกเป็น "รออนุมัติ" ทันที และเปลี่ยนเป็น "อนุมัติแล้ว" อัตโนมัติเมื่อคณะกรรมการอนุมัติครบ</p>
          <ExtFormFooter saving={h.saving} members={h.committee.length} onBack={() => h.setStep(1)} onSaveDraft={h.saveDraft} onSubmit={trySubmit} />
        </div>
      )}
    </div>
  )
}
