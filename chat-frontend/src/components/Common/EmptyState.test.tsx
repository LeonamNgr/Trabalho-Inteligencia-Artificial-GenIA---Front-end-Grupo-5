import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders default message', () => {
    render(<EmptyState />);
    expect(screen.getByText('Nenhuma mensagem ainda. Envie uma mensagem para começar.')).toBeTruthy();
  });

  it('renders custom message', () => {
    render(<EmptyState message="Nenhuma conversa ainda." />);
    expect(screen.getByText('Nenhuma conversa ainda.')).toBeTruthy();
  });
});
