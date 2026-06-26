import styles from './SendButton.module.css';

interface SendButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

export function SendButton({ disabled, onClick }: SendButtonProps) {
  return (
    <button
      className={styles.button}
      onClick={onClick}
      disabled={disabled}
      aria-label="Enviar mensagem"
    >
      →
    </button>
  );
}
