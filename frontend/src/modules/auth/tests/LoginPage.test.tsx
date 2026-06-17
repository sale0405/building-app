import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage.js';

describe('LoginPage', () => {
  it('renders sign in form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Prijava' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e-pošta/i)).toBeInTheDocument();
  });
});
