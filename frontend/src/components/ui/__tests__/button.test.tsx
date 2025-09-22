import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { Button } from '../button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Test Button</Button>)

    const button = screen.getByRole('button', { name: /test button/i })
    expect(button).toBeDefined()
  })

  it('applies default variant styling', () => {
    render(<Button>Default Button</Button>)

    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-primary')
  })

  it('applies secondary variant styling', () => {
    render(<Button variant="secondary">Secondary Button</Button>)

    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-secondary')
  })

  it('applies large size styling', () => {
    render(<Button size="lg">Large Button</Button>)

    const button = screen.getByRole('button')
    // Check for lg height class (default is h-9, lg is h-10)
    expect(button.className).toContain('h-10')
  })

  it('handles disabled state', () => {
    render(<Button disabled>Disabled Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})