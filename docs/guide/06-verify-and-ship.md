# Verify and ship

Verification must exercise the artifact that changed. A compiler pass proves types. It does not prove a UI flow, network side effect, or command transcript.

![A robot checks a built machine while another records the result.](./images/verification.jpg)

## State the finish condition

```text
$poteto-mode fix the retry duplicate. Done means the regression test passes and the real command writes one row after an interrupted retry.
```

The parent reruns authoritative checks after integrating child work. A child summary is evidence, not completion.

Match each claim to its proof. A type check supports a type claim. A focused test supports the exercised behavior. A screenshot or recording supports the visible state it shows. None of these alone proves an unrelated runtime or deployment claim.

## Create a project verification skill

If the repository lacks a repeatable real-surface check, ask:

```text
$create-verification-skill create a project skill that launches this CLI, drives one mapped command, captures a transcript, and cleans up.
```

The generated skill lives under `.agents/skills/verify-<app>/`. It contains launch, health, drive, evidence, and cleanup instructions plus a feature map. The generator runs one mapped feature before handing the skill over.

Use `$maintain-verification-skill` to compare an existing verification skill with the current app. It edits only proven drift and reruns affected live checks.

## Verify a property beyond test cases

Invoke [`$create-formal-verification-skill`](../../skills/create-formal-verification-skill/SKILL.md) for a race, retry, parser, or invariant that ordinary tests rarely reach. It selects a verifier, states bounds and assumptions, and leaves a project-local explicit-only skill. Before handoff, that skill must catch an intentionally broken variant in an isolated copy of the real code. Findings remain visible; product fixes require authorization. An unavailable verifier leaves a draft, not a passing result.

## Review the diff

Run the repository checks, inspect `git diff --check`, and use `$interrogate` for a skeptical review when the risk warrants it. Keep unsupported or trust-dependent checks visible as blockers or deferred operator gates.

## Open or merge only with authority

The [opening-a-PR playbook](../../skills/poteto-mode/playbooks/opening-a-pr.md) prepares a focused branch and pull request. The [babysit playbook](../../skills/poteto-mode/playbooks/babysit.md) watches authorized review and CI work. The [shipping playbook](../../skills/poteto-mode/playbooks/shipping.md) verifies a stack before an authorized landing action.

These playbooks do not infer permission to commit, push, open a pull request, merge, or deploy. State the allowed repository and action in the request. The parent validates the remote and branch immediately before a write.

Before a pull request is ready, compare its current head with the recorded verification result. If the patch changed after verification, rerun the affected checks. Read review dismissals as well as accepted findings.

Next: [Run authorized overnight work](./07-overnight.md).
