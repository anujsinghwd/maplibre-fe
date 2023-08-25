import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // For additional matchers
import Switch from './Switch'; // Adjust the path to your Switch component

describe('Switch Component', () => {
  it('renders the switch with correct label', () => {
    render(<Switch handleChangeToggle={() => {}} />);

    // Check initial label
    const initialLabel = screen.getByText(/(Metric|Imperial)/);
    expect(initialLabel).toBeInTheDocument();

    // Click the switch
    fireEvent.click(screen.getByText(/(Metric|Imperial)/));
    
    // Check updated label
    const updatedLabel = screen.getByText(/(Metric|Imperial)/);
    expect(updatedLabel).toBeInTheDocument();
  });

  it('calls handleChangeToggle when the switch is toggled', () => {
    const mockHandleChangeToggle = jest.fn();
    render(<Switch handleChangeToggle={mockHandleChangeToggle} />);

    // Click the switch
    fireEvent.click(screen.getByText(/(Metric|Imperial)/));

    // Check if handleChangeToggle was called with the correct argument
    expect(mockHandleChangeToggle).toHaveBeenCalledWith(true);
  });
});
