import styles from './EmptyState.module.css';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return <div className={styles.container}>{message ?? 'Nenhuma mensagem ainda. Envie uma mensagem para começar.'}</div>;
}
