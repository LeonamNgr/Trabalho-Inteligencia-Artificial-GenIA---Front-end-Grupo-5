import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { Toast } from '../Common/Toast';
import styles from './Layout.module.css';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const textarea = document.querySelector<HTMLTextAreaElement>('[aria-label="Mensagem"]');
        textarea?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.layout}>
      <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className={styles.main}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
      <Footer />
      <Toast />
    </div>
  );
}
