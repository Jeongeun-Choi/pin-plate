import * as s from './ShareMapDialog.css';

interface Props {
  currentStep: 'compose' | 'selection' | 'complete';
}

const steps = [
  { key: 'compose', label: '1 구성하기' },
  { key: 'selection', label: '2 지정하기' },
  { key: 'complete', label: '3 공유 완료' },
] as const;

export const ShareMapStepIndicator = ({ currentStep }: Props) => (
  <ol className={s.stepList} aria-label="공유 지도 만들기 단계">
    {steps.map((step) => (
      <li
        key={step.key}
        className={currentStep === step.key ? s.stepItemCurrent : s.stepItem}
        aria-current={currentStep === step.key ? 'step' : undefined}
      >
        {step.label}
      </li>
    ))}
  </ol>
);
