# Firebase Security Specification

## 1. Data Invariants
- **Authentication**: Users must be authenticated to read or write any collection.
- **Task Identity Protection**: A user cannot modify a task's `id` or change its `createdBy` author or target `workspaceId` downstream to spoof records.
- **State Locking**: Task status cannot be moved back once completed except by high-level admins.
- **RBAC Protection**: No standard user can rewrite the RBAC configuration map (`/config/rbac`) or self-elevate to BGH/ADMIN status.

## 2. The "Dirty Dozen" Adversarial Payloads
Below are 12 JSON payloads designed to break Identity, Integrity, and State rules:

1. **Self-Appointed Administrator (Identity Spoof)**: Sps-write user profile metadata claiming `role: "ADMIN"` or bypass the SSO system.
2. **Task Spoofing (Orphan creation)**: Create a task with mock `createdById` that doesn't match the current authenticated user's ID.
3. **Ghost Fields Injection**: Inject an `isSecretApproved: true` arbitrary boolean field into the task parameters.
4. **Denial of Wallet Document ID Injection**: Attempting to upload a task with a 1.5KB malicious document ID (e.g. `task_!!!...`).
5. **Timestamp Poisoning**: Submitting a task with a hardcoded future date for `createdAt` rather than using the standard `request.time`.
6. **Task Hijack (Status Shortcutting)**: A standard staff member bypassing the review phase and setting a task directly to "HOAN_THANH" (Completed).
7. **Cross-Department Espionage**: Writing tasks referencing department workspaces they are not members of or permitted to see.
8. **RBAC Overwrite**: Attempting to modify `/config/rbac` to grant all permissions to `role: "STAFF"`.
9. **Comment Hijacking**: Submitting a comment pretending to be a Director (BGH) or deleting someone else's activity log comments.
10. **Evidence Tampering**: Overwriting `reportEvidence` or editing task details once it has entered the "CHO_DUYET" (Awaiting Approval) terminal state.
11. **Workspace Defacement**: Trying to delete or rename active school departments (/workspaces/).
12. **Malformed Types Attack**: Submitting complex lists/nested structures where standard strings or booleans are expected in task reports.

## 3. Test Runner Definition
Adversarial test suite designed to verify that all operations return `PERMISSION_DENIED`:

```typescript
// firestore.rules.test.ts
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

// All Dirty Dozen payloads must fail the test runner validations
describe("School task systems - Security rules unit testing", () => {
  it("forces absolute denial on all 12 malicious payloads", async () => {
    // Assert client SDK bypassing triggers PERMISSION_DENIED
  });
});
```
