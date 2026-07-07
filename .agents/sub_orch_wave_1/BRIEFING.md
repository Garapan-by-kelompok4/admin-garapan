# BRIEFING — 2026-06-29T02:17:15+07:00

## Mission
Orchestrate and verify Wave 1 (Foundation) of the implementation track.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\sub_orch_wave_1
- Original parent: main agent
- Original parent conversation ID: 70c52116-95dc-4652-990e-6c04ce9f4fea

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\sub_orch_wave_1\SCOPE.md
1. **Decompose**: Decompose Wave 1 scope into distinct verifiable milestones and tasks.
2. **Dispatch & Execute**:
   - **Direct (iteration loop)**: Use the Explorer -> Worker -> Reviewer -> Challenger -> Forensic Auditor cycle to implement and verify each component.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: Self-succeed at spawn count >= 16. Kill timers, write handoff.md, spawn successor, report parent ID.
- **Work items**:
  1. Scaffold Integration [pending]
  2. BFF Authentication routes [pending]
  3. Wildcard BFF proxy route [pending]
  4. Route protection middleware [pending]
  5. Main dashboard layout shell [pending]
  6. Login page [pending]
- **Current phase**: 1
- **Current focus**: Scaffold Integration

## 🔒 Key Constraints
- Never write, modify, or create source code files directly.
- Never run build/test commands yourself — require workers to do so.
- You MAY use file-editing tools ONLY for metadata/state files (.md) in your .agents/ folder.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.
- Binary veto on Forensic Auditor failure or cheating detection.

## Current Parent
- Conversation ID: 70c52116-95dc-4652-990e-6c04ce9f4fea
- Updated: not yet

## Key Decisions Made
- [Initial Decision] Set up Wave 1 plan.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| Explorer 1 | teamwork_preview_explorer | Wave 1 Exploration | completed | 5ddf6b3f-be13-44d6-a4e0-dba83cc041af |
| Explorer 2 | teamwork_preview_explorer | Wave 1 Exploration | completed | f3f3a226-4580-4dc3-a715-0512d2bb0afd |
| Explorer 3 | teamwork_preview_explorer | Wave 1 Exploration | completed | c1b33b90-e20e-47ed-aaee-31693b31a128 |
| Worker 1 | teamwork_preview_worker | Wave 1 Implementation | in-progress | 083316e4-525a-41a4-8369-f67af403e765 |

## Succession Status
- Succession required: no
- Spawn count: 4 / 16
- Pending subagents: c1b33b90-e20e-47ed-aaee-31693b31a128, 083316e4-525a-41a4-8369-f67af403e765
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: task-39
- Safety timer: task-123

## Artifact Index
- c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\sub_orch_wave_1\progress.md — Tracking step-by-step progress
- c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\sub_orch_wave_1\SCOPE.md — Detailed scope document
- c:\Users\Andika Rafa Akbar\Projek\PBP\admin-garapan\.agents\sub_orch_wave_1\handoff.md — Handoff report
