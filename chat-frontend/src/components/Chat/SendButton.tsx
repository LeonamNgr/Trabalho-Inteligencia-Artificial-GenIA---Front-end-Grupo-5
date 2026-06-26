import styles from './SendButton.module.css';

interface SendButtonProps {
<<<<<<< HEAD
  disabled?: boolean;
  onClick?: () => void;
=======
  disabled: boolean;
  onClick: () => void;
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
}

export function SendButton({ disabled, onClick }: SendButtonProps) {
  return (
<<<<<<< HEAD
    <button
      className={styles.button}
      onClick={onClick}
      disabled={disabled}
      aria-label="Enviar mensagem"
    >
      →
=======
    <button className={styles.sendButton} onClick={onClick} disabled={disabled} type="button" aria-label="Enviar mensagem">
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
    </button>
  );
}
