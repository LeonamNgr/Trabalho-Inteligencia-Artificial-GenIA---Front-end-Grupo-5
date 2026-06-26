import styles from './TextArea.module.css';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  'aria-describedby'?: string;
}

export function TextArea(props: TextAreaProps) {
  return (
    <textarea
      {...props}
      className={`${styles.textarea} ${props.className || ''}`}
      aria-label="Mensagem"
    />
  );
}
