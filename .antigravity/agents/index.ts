// agents/index.ts
import { UX_DESIGNER_PROMPT } from "./ux-designer/prompt";
import { FRONTEND_PROMPT } from "./frontend-developer/prompt";
import { UI_DESIGNER_PROMPT } from "./ui-designer/prompt";
import { QA_ENGINEER_PROMPT } from "./qa-engineer/prompt";
// ... 기타 임포트

export const antigravityAgents = {
  ux: {
    role: "UX_DESIGNER",
    systemPrompt: UX_DESIGNER_PROMPT,
    next: "ui", // UX 작업 후 UI로 전달
  },
  ui: {
    role: "UI_DESIGNER",
    systemPrompt: UI_DESIGNER_PROMPT,
    next: "frontend",
  },
  frontend: {
    role: "FRONTEND_DEVELOPER",
    systemPrompt: FRONTEND_PROMPT,
    next: "qa",
  },
  qa: {
    role: "QA_ENGINEER",
    systemPrompt: QA_ENGINEER_PROMPT,
  },
} as const;
