import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonLoader } from './SkeletonLoader';

describe('SkeletonLoader', () => {
  it('renders default 3 lines', () => {
    const { container } = render(<SkeletonLoader />);
    const lines = container.querySelectorAll('[class*="line"]');
    expect(lines).toHaveLength(3);
  });

  it('renders custom number of lines', () => {
    const { container } = render(<SkeletonLoader lines={5} />);
    const lines = container.querySelectorAll('[class*="line"]');
    expect(lines).toHaveLength(5);
  });

  it('has loading aria-label', () => {
    render(<SkeletonLoader />);
    expect(screen.getByLabelText('Carregando...')).toBeTruthy();
  });
});
