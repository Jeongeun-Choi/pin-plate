import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dropdown } from '@pin-plate/ui';

const OPTIONS = [
  { value: 'recommend', label: '다녀옴' },
  { value: 'want_to_revisit', label: '다시 가고 싶음' },
  { value: 'cafe', label: '카페' },
];

const DropdownHarness = () => {
  const [selectedValue, setSelectedValue] = useState('recommend');

  return (
    <Dropdown
      id="share-map-status"
      value={selectedValue}
      options={OPTIONS}
      onChange={setSelectedValue}
    />
  );
};

describe('Dropdown', () => {
  it('renders an accessible trigger and selected option state', () => {
    render(<DropdownHarness />);

    const trigger = screen.getByRole('button', { name: '다녀옴' });

    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    const selectedOption = screen.getByRole('option', { name: '다녀옴' });
    expect(selectedOption).toHaveAttribute('aria-selected', 'true');
    expect(selectedOption.querySelector('svg')).toBeInTheDocument();
  });

  it('changes value from an option click and closes the menu', () => {
    render(<DropdownHarness />);

    fireEvent.click(screen.getByRole('button', { name: '다녀옴' }));
    fireEvent.click(screen.getByRole('option', { name: '다시 가고 싶음' }));

    expect(
      screen.getByRole('button', { name: '다시 가고 싶음' }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation and selection', () => {
    render(<DropdownHarness />);

    const trigger = screen.getByRole('button', { name: '다녀옴' });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(
      screen.getByRole('button', { name: '다시 가고 싶음' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes the menu on Escape and outside click', () => {
    render(
      <div>
        <button type="button">외부 버튼</button>
        <DropdownHarness />
      </div>,
    );

    fireEvent.click(screen.getByRole('button', { name: '다녀옴' }));
    fireEvent.keyDown(screen.getByRole('button', { name: '다녀옴' }), {
      key: 'Escape',
    });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다녀옴' }));
    fireEvent.mouseDown(screen.getByRole('button', { name: '외부 버튼' }));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not open or change value when disabled', () => {
    const handleChange = vi.fn();

    render(
      <Dropdown
        id="share-map-status"
        value="recommend"
        options={OPTIONS}
        onChange={handleChange}
        disabled
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '다녀옴' }));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });
});
