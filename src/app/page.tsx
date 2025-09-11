import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Polaris Catalog Admin Panel
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'var(--gray-rgb)',
              opacity: '0.7',
              margin: '0'
            }}>
              Manage your Apache Polaris catalogs and authentication
            </p>
          </div>

          <ul style={{
            listStyle: 'none',
            padding: '0',
            margin: '0',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center'
          }}>
            <li>
              <Link href="/auth" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                backgroundColor: 'var(--gray-alpha-100)',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                fontSize: '18px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                minWidth: '200px'
              }}>
                🔐 Authentication
              </Link>
            </li>
            <li>
              <Link href="/catalog" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                backgroundColor: 'var(--gray-alpha-100)',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                fontSize: '18px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                minWidth: '200px'
              }}>
                📊 Catalogs
              </Link>
            </li>
          </ul>

        </main>
      </div>
  );
}
