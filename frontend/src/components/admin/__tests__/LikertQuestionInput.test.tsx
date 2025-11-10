import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { LikertQuestionInput } from '../LikertQuestionInput'

describe('LikertQuestionInput', () => {
  const defaultProps = {
    questionIndex: 0,
    value: 'Test question',
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders question input field', () => {
    render(<LikertQuestionInput {...defaultProps} />)
    expect(screen.getByDisplayValue('Test question')).toBeInTheDocument()
  })

  it('calls onChange when text is updated', () => {
    render(<LikertQuestionInput {...defaultProps} />)
    
    const input = screen.getByDisplayValue('Test question')
    fireEvent.change(input, { target: { value: 'Updated question' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('Updated question')
  })

  it('shows likert scale information', () => {
    render(<LikertQuestionInput {...defaultProps} />)
    
    expect(screen.getByText('Этот вопрос будет использовать 5-балльную шкалу Лайкерта:')).toBeInTheDocument()
    expect(screen.getByText('1 - Полностью не согласен')).toBeInTheDocument()
    expect(screen.getByText('5 - Полностью согласен')).toBeInTheDocument()
  })

  it('displays error message when provided', () => {
    render(<LikertQuestionInput {...defaultProps} error="This field is required" />)
    
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })
})
