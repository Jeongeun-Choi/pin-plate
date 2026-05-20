'use client'

import * as s from './TagChip.css'

interface Props {
  label: string
  selected?: boolean
  onClick?: () => void
  onRemove?: () => void
  readonly?: boolean
  disabled?: boolean
}

export const TagChip = ({
  label,
  selected,
  onClick,
  onRemove,
  readonly,
  disabled,
}: Props) => {
  if (onClick && !readonly) {
    return (
      <button
        type="button"
        className={selected ? s.chipSelected : s.chip}
        onClick={onClick}
        aria-pressed={selected}
        disabled={disabled}
      >
        {label}
      </button>
    )
  }

  return (
    <div className={selected ? s.chipSelected : s.chip}>
      {label}
      {onRemove && (
        <button
          type="button"
          className={s.removeBtn}
          onClick={onRemove}
          aria-label={`${label} 태그 제거`}
        >
          ×
        </button>
      )}
    </div>
  )
}
