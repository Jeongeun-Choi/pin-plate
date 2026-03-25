/**
 * 유저의 레포에 설치할 GitHub Actions 워크플로우 YAML 템플릿을 반환합니다.
 * Setup Automation 기능에서 Octokit으로 유저 레포에 직접 파일을 생성할 때 사용합니다.
 */
export function getWorkflowTemplate(): string {
  return `name: GhostDev Agent

on:
  workflow_dispatch:
    inputs:
      run_id:
        description: 'GhostDev run ID'
        required: true
        type: string
      ticket_id:
        description: 'Ticket ID'
        required: true
        type: string
      ticket_title:
        description: 'Ticket title'
        required: true
        type: string
      ticket_description:
        description: 'Ticket description'
        required: false
        type: string
        default: ''
      base_branch:
        description: 'Base branch to checkout'
        required: false
        type: string
        default: 'main'
      supabase_url:
        description: 'GhostDev Supabase URL (for log streaming)'
        required: true
        type: string
      target_workspace:
        description: 'Target workspace/package path (monorepo)'
        required: false
        type: string
        default: ''

jobs:
  ghostdev:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          ref: \${{ inputs.base_branch }}
          fetch-depth: 0
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Setup git identity
        run: |
          git config user.name "GhostDev[bot]"
          git config user.email "ghostdev[bot]@users.noreply.github.com"

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run GhostDev Agent
        env:
          # 유저 본인의 API 키 — GhostDev 서버는 절대 알 수 없음
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
          # GhostDev가 제공하는 로그 스트리밍용 service key
          GHOSTDEV_SUPABASE_SERVICE_KEY: \${{ secrets.GHOSTDEV_SUPABASE_SERVICE_KEY }}
          # workflow_dispatch inputs → 에이전트 환경변수
          GHOSTDEV_RUN_ID: \${{ inputs.run_id }}
          GHOSTDEV_TICKET_ID: \${{ inputs.ticket_id }}
          GHOSTDEV_TICKET_TITLE: \${{ inputs.ticket_title }}
          GHOSTDEV_TICKET_DESCRIPTION: \${{ inputs.ticket_description }}
          GHOSTDEV_BASE_BRANCH: \${{ inputs.base_branch }}
          GHOSTDEV_SUPABASE_URL: \${{ inputs.supabase_url }}
          GHOSTDEV_TARGET_WORKSPACE: \${{ inputs.target_workspace }}
          # GitHub Actions 기본 제공 토큰 (PR 생성에 사용)
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: npx @ghostdev/agent@latest
`;
}
