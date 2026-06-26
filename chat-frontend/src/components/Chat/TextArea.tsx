import { useRef, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
import styles from './TextArea.module.css';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  disabled: boolean;
  placeholder: string;
}

export function TextArea({ value, onChange, onKeyDown, disabled, placeholder }: TextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value);

  return (
    <textarea
      ref={textareaRef}
      className={styles.textarea}
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      rows={1}
    />
  );
}
