import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders message text', () => {
    render(<ErrorMessage message="Algo deu errado" />);
    expect(screen.getByText('Algo deu errado')).toBeTruthy();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Erro" onRetry={onRetry} />);
    fireEvent.click(screen.getByText('Tentar novamente'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Erro" />);
    expect(screen.queryByText('Tentar novamente')).toBeNull();
  });

  it('has role alert', () => {
    render(<ErrorMessage message="Erro" />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
