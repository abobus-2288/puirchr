import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { LikertAnswerInput } from '../LikertAnswerInput'

describe('LikertAnswerInput', () => {
  const defaultProps = {
    questionText: 'How satisfied are you?',
    value: undefined,
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders question text', () => {
    render(<LikertAnswerInput {...defaultProps} />)
    expect(screen.getByText('How satisfied are you?')).toBeInTheDocument()
  })

  it('renders all likert scale options', () => {
    render(<LikertAnswerInput {...defaultProps} />)
    
    expect(screen.getByText('Полностью не согласен')).toBeInTheDocument()
    expect(screen.getByText('Не согласен')).toBeInTheDocument()
    expect(screen.getByText('Нейтрально')).toBeInTheDocument()
    expect(screen.getByText('Согласен')).toBeInTheDocument()
    expect(screen.getByText('Полностью согласен')).toBeInTheDocument()
  })

  it('calls onChange when option is selected', () => {
    render(<LikertAnswerInput {...defaultProps} />)
    
    const option = screen.getByText('Согласен').closest('button')
    fireEvent.click(option!)
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(4)
  })

  it('highlights selected option', () => {
    render(<LikertAnswerInput {...defaultProps} value={3} />)
    
    const selectedOption = screen.getByText('Нейтрально').closest('button')
    expect(selectedOption).toHaveClass('bg-blue-600', 'text-white')
  })

  it('shows checkmark for selected option', () => {
    render(<LikertAnswerInput {...defaultProps} value={5} />)
    
    expect(screen.getByTestId('check-icon')).toBeInTheDocument()
  })
})
