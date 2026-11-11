// frontend/src/pages/profile/components/ProfileCard.tsx — การ์ดมาตรฐานของหน้าโปรไฟล์
import { useId, type ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: string
  desc?: ReactNode
  status?: ReactNode
  children: ReactNode
}

export default function ProfileCard({ icon, title, desc, status, children }: Props) {
  const id = useId()
  return (
    <section className="profile-card" aria-labelledby={id}>
      <header className="profile-card__head">
        <span className="profile-card__icon" aria-hidden="true">{icon}</span>
        <div className="profile-card__titles">
          <h3 id={id} className="profile-card__title">{title}</h3>
          {desc && <p className="profile-card__desc">{desc}</p>}
        </div>
        {status}
      </header>
      <div className="profile-card__body">{children}</div>
    </section>
  )
}
