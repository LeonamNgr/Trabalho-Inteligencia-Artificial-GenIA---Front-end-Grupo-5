import { useState, useCallback } from 'react';
import { ConversationHistory } from '../History/ConversationHistory';
import { ChatWindow } from '../Chat/ChatWindow';
import { UploadArea } from '../Upload/UploadArea';
import styles from './Layout.module.css';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className={styles.layout}>
      <button className={styles.menuButton} onClick={toggleSidebar} type="button" aria-label="Abrir menu">
        <span className={styles.menuIcon} />
      </button>

      <aside className={`${styles.sidebar}${sidebarOpen ? ` ${styles.sidebarOpen}` : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Conversas</span>
          <button className={styles.closeButton} onClick={closeSidebar} type="button" aria-label="Fechar menu">
            &times;
          </button>
        </div>
        <ConversationHistory />
      </aside>

      {sidebarOpen && <div className={styles.overlay} onClick={closeSidebar} aria-hidden="true" />}

      <main className={styles.main}>
        <section className={styles.chatSection}>
          <ChatWindow />
        </section>
        <section className={styles.uploadSection}>
          <UploadArea />
        </section>
      </main>
    </div>
  );
}
