import styles from './SendButton.module.css';

interface SendButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export function SendButton({ disabled, onClick }: SendButtonProps) {
  return (
    <button className={styles.sendButton} onClick={onClick} disabled={disabled} type="button" aria-label="Enviar mensagem">
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    </button>
  );
}
