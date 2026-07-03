# Operational Plan - GARAPAN Admin Panel

This is the internal planning guide for the Project Orchestrator. The global project milestones and layout are tracked in the root `PROJECT.md` file.

## Operational Strategy

We will execute the GARAPAN Admin Panel using the **Project Pattern**, which splits development into parallel tracks:
1. **E2E Testing Track**: Derives opaque-box tests from requirements. Output: `TEST_READY.md`.
2. **Implementation Track**: Implements features in sequential waves. Must pass 100% of E2E tests in the final milestone, followed by white-box coverage hardening.

### Wave Execution Strategy
For each Wave/Milestone:
1. Spawn a **Sub-Orchestrator** to manage the milestone.
2. The Sub-Orchestrator will coordinate **Explorer(s)** to plan implementation, a **Worker** to code and execute local verification (builds & tests), **Reviewer(s)** to perform QA check, **Challenger(s)** to design edge-case test models, and a **Forensic Auditor** to verify integrity.
3. Once the milestone passes all checks (build/tests pass, no reviewer vetoes, challenger confirms, auditor is clean), the milestone is marked `DONE`.

### Resource & Life-Cycle Management
- **Succession Trigger**: When total spawns reach 16, we self-succeed. We will write `handoff.md`, spawn a successor Project Orchestrator, and exit.
- **Heartbeat & Safety Timers**: We run a heartbeat check every 10 minutes to verify sub-orchestrator activity.
