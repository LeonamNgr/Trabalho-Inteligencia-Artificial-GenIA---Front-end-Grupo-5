import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SendButton } from './SendButton';

describe('SendButton', () => {
  it('renders with aria-label', () => {
    render(<SendButton />);
    expect(screen.getByLabelText('Enviar mensagem')).toBeTruthy();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<SendButton onClick={onClick} />);
    fireEvent.click(screen.getByLabelText('Enviar mensagem'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<SendButton disabled />);
    expect(screen.getByLabelText('Enviar mensagem')).toBeDisabled();
  });
});
