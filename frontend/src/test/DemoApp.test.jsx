import React from 'react'
import { render, screen } from '@testing-library/react'
import DemoApp from '../../react-ui/ui-kit/DemoApp'

test('renders welcome text', () => {
  render(<DemoApp />)
  // use getByText which throws if not found; avoid jest-dom matcher dependency
  const el = screen.getByText(/Bienvenido a Oasis/i)
  expect(el).toBeTruthy()
})
