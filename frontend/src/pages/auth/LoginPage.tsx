// frontend/src/pages/auth/LoginPage.tsx

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../../helpers/services/authService'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
      return
    }

    setLoading(true)
    try {
      await authService.login({ username: username.trim(), password })
      navigate('/', { replace: true })
    } catch (err: any) {
      const msg = err?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ───── Left panel: branding ───── */}
      <div
        className="hidden md:flex"
        style={{
          flex: '1 1 60%',
          background: 'var(--primary, #2563EB)',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 48px 32px',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -100, right: -60,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -40,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', top: '35%', right: '30%',
          width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        {/* Top: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#fff',
          }}>
            P
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Plasm</span>
        </div>

        {/* Middle: Hero text */}
        <div style={{ position: 'relative' }}>
          <h1 style={{
            fontSize: 42, fontWeight: 700, color: '#fff',
            lineHeight: 1.2, marginBottom: 20,
          }}>
            ระบบจัดเก็บและ<br />นำออกพลาสมา
          </h1>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.7, maxWidth: 420,
          }}>
            ติดตามสต็อก FFP แยกตามหมู่เลือด รู้ตำแหน่งทุก Unit และแจ้งเตือนเมื่อต่ำกว่าขั้นต่ำ
          </p>

          {/* Blood group circles */}
          <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
            {['A', 'B', 'O', 'AB'].map((g) => (
              <div key={g} style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 600, color: '#fff',
              }}>
                {g}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Copyright */}
        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,0.4)',
          position: 'relative',
        }}>
          © MedtechSoft
        </p>
      </div>

      {/* ───── Right panel: login form ───── */}
      <div style={{
        flex: '1 1 40%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
        background: 'var(--background, #FAFAFA)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo */}
          <div className="md:hidden" style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--primary, #2563EB)',
              fontSize: 22, fontWeight: 700, color: '#fff',
              marginBottom: 12,
            }}>
              P
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary, #18181B)' }}>
              Plasm
            </h1>
          </div>

          {/* Heading */}
          <h2 style={{
            fontSize: 28, fontWeight: 700,
            color: 'var(--text-primary, #18181B)',
            marginBottom: 8,
          }}>
            เข้าสู่ระบบ
          </h2>
          <p style={{
            fontSize: 15,
            color: 'var(--text-secondary, #71717A)',
            marginBottom: 36,
          }}>
            ใช้บัญชีของธนาคารเลือด
          </p>

          {error && (
            <div style={{
              background: 'var(--danger-surface, #FEF2F2)',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '10px 14px',
              marginBottom: 24,
              fontSize: 13, fontWeight: 500,
              color: 'var(--danger-ink, #991B1B)',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="username" style={{
                display: 'block', fontSize: 14, fontWeight: 500,
                color: 'var(--text-primary, #18181B)',
                marginBottom: 8,
              }}>
                ชื่อผู้ใช้
              </label>
              <input
                id="username" type="text" value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username" autoFocus
                style={{
                  width: '100%', height: 48, padding: '0 16px',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--border, #E4E4E7)',
                  fontSize: 15, color: 'var(--text-primary, #18181B)',
                  background: '#fff',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary, #2563EB)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border, #E4E4E7)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label htmlFor="password" style={{
                display: 'block', fontSize: 14, fontWeight: 500,
                color: 'var(--text-primary, #18181B)',
                marginBottom: 8,
              }}>
                รหัสผ่าน
              </label>
              <input
                id="password" type="password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{
                  width: '100%', height: 48, padding: '0 16px',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--border, #E4E4E7)',
                  fontSize: 15, color: 'var(--text-primary, #18181B)',
                  background: '#fff',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary, #2563EB)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border, #E4E4E7)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', height: 50,
                borderRadius: 25,
                border: 'none',
                background: loading
                  ? 'var(--text-disabled, #A1A1AA)'
                  : 'var(--primary, #2563EB)',
                color: '#fff',
                fontSize: 16, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = 'var(--primary-hover, #1D4ED8)'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = 'var(--primary, #2563EB)'
              }}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          {/* Hint */}
          <p style={{
            textAlign: 'center', fontSize: 13,
            color: 'var(--text-disabled, #A1A1AA)',
            marginTop: 20,
          }}>
            ใช้บัญชี admin / admin123
          </p>
        </div>
      </div>
    </div>
  )
}