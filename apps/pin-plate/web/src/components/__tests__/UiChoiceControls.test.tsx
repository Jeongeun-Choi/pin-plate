import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Checkbox, Radio } from '@pin-plate/ui';

const CheckboxHarness = () => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <Checkbox
      label="성수 카페"
      checked={isChecked}
      onChange={(event) => setIsChecked(event.target.checked)}
    />
  );
};

const RadioHarness = () => {
  const [selectedValue, setSelectedValue] = useState('status');

  return (
    <div>
      <Radio
        label="상태"
        name="share-map-criteria"
        value="status"
        checked={selectedValue === 'status'}
        onChange={(event) => setSelectedValue(event.target.value)}
      />
      <Radio
        label="지역"
        name="share-map-criteria"
        value="region"
        checked={selectedValue === 'region'}
        onChange={(event) => setSelectedValue(event.target.value)}
      />
    </div>
  );
};

describe('ui choice controls', () => {
  it('renders an accessible checkbox label and forwards checked changes', () => {
    const { container } = render(<CheckboxHarness />);

    const checkbox = screen.getByRole('checkbox', { name: '성수 카페' });

    expect(checkbox).not.toBeChecked();
    expect(
      container.querySelector('[aria-hidden="true"] svg'),
    ).toBeInTheDocument();

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it('renders accessible radio labels and forwards selected values', () => {
    render(<RadioHarness />);

    const statusRadio = screen.getByRole('radio', { name: '상태' });
    const regionRadio = screen.getByRole('radio', { name: '지역' });

    expect(statusRadio).toBeChecked();
    expect(regionRadio).not.toBeChecked();

    fireEvent.click(regionRadio);

    expect(statusRadio).not.toBeChecked();
    expect(regionRadio).toBeChecked();
  });
});
