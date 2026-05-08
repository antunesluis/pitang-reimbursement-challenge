# Test Documentation

## Overview

| Suite     | Files  | Tests   | Runner     | Framework                      |
| --------- | ------ | ------- | ---------- | ------------------------------ |
| Backend   | 5      | 68      | `bun:test` | supertest                      |
| Frontend  | 14     | 66      | `bun:test` | jsdom + @testing-library/react |
| **Total** | **19** | **134** |            |                                |

### Commands

```bash
bun run --cwd packages/backend test          # all backend tests
bun run --cwd packages/backend test tests/auth.test.ts  # single file
bun run --cwd packages/frontend test         # all frontend tests
```

---

## Backend Tests (68 tests)

All tests use `bun:test` + `supertest` against the Express app. Each test suite starts by cleaning the database and seeding an ADMIN user.

### auth.test.ts (7 tests)

| #   | Test                                                         | Description                                            |
| --- | ------------------------------------------------------------ | ------------------------------------------------------ |
| 1   | POST /auth/login returns 200 and token for valid credentials | Admin login, verifies token + user shape (no password) |
| 2   | POST /auth/login returns 401 for invalid password            | Wrong password → 401 + message                         |
| 3   | POST /auth/login returns 401 for nonexistent user            | Unknown email → 401                                    |
| 4   | POST /auth/login returns 400 for invalid body                | Bad email format → 400 + `errors` array                |
| 5   | GET /auth/me returns 200 and current user for valid token    | Token validates, returns user data                     |
| 6   | GET /auth/me returns 401 without token                       | No auth header → 401                                   |
| 7   | GET /auth/me returns 401 with invalid token                  | Junk token → 401                                       |

### users.test.ts (6 tests)

| #   | Test                                        | Description                                          |
| --- | ------------------------------------------- | ---------------------------------------------------- |
| 1   | POST /users creates user when ADMIN         | Creates EMPLOYEE user → 201, no password in response |
| 2   | POST /users returns 401 without auth        | No token → 401                                       |
| 3   | POST /users returns 403 for non-ADMIN       | EMPLOYEE trying → 403                                |
| 4   | POST /users returns 409 for duplicate email | Same email twice → 409                               |
| 5   | GET /users lists all users for ADMIN        | Paginated response with `data` array                 |
| 6   | GET /users returns 403 for EMPLOYEE         | Non-ADMIN → 403                                      |

### categories.test.ts (8 tests)

| #   | Test                                                        | Description                 |
| --- | ----------------------------------------------------------- | --------------------------- |
| 1   | GET /categories returns 401 without auth                    | No token → 401              |
| 2   | POST /categories creates category as ADMIN                  | Valid → 201, `active: true` |
| 3   | POST /categories returns 403 for EMPLOYEE                   | Non-ADMIN → 403             |
| 4   | GET /categories lists all categories for authenticated user | EMPLOYEE can list → 200     |
| 5   | POST /categories returns 409 for duplicate name             | Duplicate → 409             |
| 6   | PUT /categories/:id updates category as ADMIN               | Rename + deactivate → 200   |
| 7   | PUT /categories/:id returns 403 for non-ADMIN               | EMPLOYEE → 403              |
| 8   | PUT /categories/:id returns 404 for nonexistent             | Invalid ID → 404            |

### reimbursements.test.ts (38 tests)

**CRUD & Validation (4):**
| # | Test | Description |
|---|------|-------------|
| 1 | POST /reimbursements creates DRAFT | Creates → 201, verifies status/amount/requester |
| 2 | POST /reimbursements returns 400 for inactive category | Inactive cat → 400 |
| 3 | POST /reimbursements returns 400 for future expense date | Future date → 400 |
| 4 | POST /reimbursements returns 403 for MANAGER | Non-EMPLOYEE → 403 |

**Full Flow: DRAFT → PAID (3):**
| # | Test | Description |
|---|------|-------------|
| 5 | cannot edit after submit | After submit → 400 |
| 6 | cannot pay twice | After PAID → 400 "Invalid status transition" |
| 7 | history has 5 entries | CREATED, UPDATED, SUBMITTED, APPROVED, PAID |

**Reject Flow (1):**
| # | Test | Description |
|---|------|-------------|
| 8 | DRAFT → SUBMITTED → REJECTED with justification | Reject → 200, rejectionReason present |

**Cancel Flow (1):**
| # | Test | Description |
|---|------|-------------|
| 9 | DRAFT → CANCELLED | Cancel → 200, cannot submit cancelled → 400 |

**List Filtering (3):**
| # | Test | Description |
|---|------|-------------|
| 10 | EMPLOYEE sees only own reimbursements | All results have requester = self |
| 11 | MANAGER sees only SUBMITTED | All results have status SUBMITTED |
| 12 | FINANCE sees only APPROVED | All results have status APPROVED |

**404 & View Restrictions (6):**
| # | Test | Description |
|---|------|-------------|
| 13 | GET /reimbursements/:id returns 404 for nonexistent | Invalid ID → 404 |
| 14 | MANAGER cannot view DRAFT | → 403 |
| 15 | FINANCE cannot view SUBMITTED | → 403 |
| 16 | MANAGER can view SUBMITTED | → 200 |
| 17 | FINANCE can view APPROVED | → 200 |
| 18 | MANAGER cannot view APPROVED after approving | Post-approve → 403 |
| 19 | FINANCE cannot view PAID after paying | Post-pay → 403 |

**Invalid Transitions (2):**
| # | Test | Description |
|---|------|-------------|
| 20 | cannot pay a REJECTED | → 400 "Invalid status transition" |
| 21 | cannot edit a CANCELLED | → 400 "Only DRAFT reimbursements can be edited" |

**Stats (5):**
| # | Test | Description |
|---|------|-------------|
| 22 | Employee stats | `{ total, draft, submitted, approved, paid }` |
| 23 | Manager stats | `{ pending, approvedThisMonth, rejectedThisMonth }` |
| 24 | Finance stats | `{ pending, paidThisMonth, paidAmountThisMonth }` |
| 25 | Admin stats | `{ reimbursements, users, categories, pendingReview }` |
| 26 | No auth → 401 | |

**Pagination & Sorting (4):**
| # | Test | Description |
|---|------|-------------|
| 27 | Supports pagination | `?page=1&limit=2` → `{ page, limit, total, totalPages, data }` |
| 28 | Sorting by amount desc | `?sort=amount&order=desc` → 200 |
| 29 | Invalid sort field → 400 | `?sort=invalid` → 400 + `errors` |
| 30 | Negative page → 400 | `?page=-1` → 400 |

**Status Filter Restrictions (5):**
| # | Test | Description |
|---|------|-------------|
| 31 | MANAGER `?status=DRAFT` → 400 | |
| 32 | MANAGER `?status=PAID` → 400 | |
| 33 | FINANCE `?status=SUBMITTED` → 400 | |
| 34 | FINANCE `?status=DRAFT` → 400 | |
| 35 | EMPLOYEE `?status=DRAFT` → 200 (filtered) | |

**Inter-Role Access (3):**
| # | Test | Description |
|---|------|-------------|
| 36 | EMPLOYEE cannot approve | → 403 |
| 37 | FINANCE cannot approve | → 403 |
| 38 | MANAGER cannot pay | → 403 |

### attachments.test.ts (9 tests)

| #   | Test                                      | Description                               |
| --- | ----------------------------------------- | ----------------------------------------- |
| 1   | Upload PDF                                | → 201, verifies fileName/fileType/fileUrl |
| 2   | Invalid file type                         | `.txt` → 400                              |
| 3   | No file in request                        | → 400                                     |
| 4   | Non-owner upload                          | MANAGER → 403                             |
| 5   | List attachments (owner)                  | → 200, `length >= 1`                      |
| 6   | List attachments (manager when SUBMITTED) | After submit → 200                        |
| 7   | List attachments (manager when DRAFT)     | → 403                                     |
| 8   | Upload to nonexistent                     | → 404                                     |
| 9   | Upload to SUBMITTED                       | After submit → 400                        |

---

## Frontend Tests (66 tests)

All tests use `bun:test` + `jsdom` + `@testing-library/react` with preload scripts (`dom.ts` for DOM globals, `setup.tsx` for cleanup + `jest-dom` matchers).

### Permission Hook (21 tests)

**File:** `usePermissions.test.tsx`

| Category      | Tests | Coverage                                                                                                                     |
| ------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------- |
| Role checks   | 5     | `isAdmin`, `isEmployee`, `isManager`, `isFinance`, all false for null                                                        |
| Action checks | 16    | `isOwner`, `canEdit` (3), `canSubmit` (2), `canApprove` (2), `canReject` (1), `canPay` (2), `canCancel` (3), `canUpload` (3) |

### Form Tests (5 tests, 3 files)

**File:** `LoginForm.test.tsx` (2 tests)
| # | Test |
|---|------|
| 1 | Shows validation errors for invalid fields on submit |
| 2 | Button is enabled and shows correct text |

**File:** `CreateUser.test.tsx` (1 test)
| # | Test |
|---|------|
| 1 | Shows validation errors for invalid fields (name, email, password) |

**File:** `CreateCategory.test.tsx` (1 test)
| # | Test |
|---|------|
| 1 | Shows error for short name on submit |

**File:** `ReimbursementForm.test.tsx` (4 tests)
| # | Test |
|---|------|
| 1 | Shows validation errors for all empty fields |
| 2 | Shows root error when present |
| 3 | Disables submit button when submitting |
| 4 | Shows submit label |

### UI Component Tests (19 tests, 5 files)

**File:** `StatusBadge.test.tsx` (6 tests)
| # | Test |
|---|------|
| 1-6 | Renders each status (DRAFT/SUBMITTED/APPROVED/REJECTED/PAID/CANCELLED) with correct styling |

**File:** `StatsCard.test.tsx` (3 tests)
| # | Test |
|---|------|
| 1 | Renders the label and value |
| 2 | Applies custom className |
| 3 | Renders the icon |

**File:** `FieldError.test.tsx` (3 tests)
| # | Test |
|---|------|
| 1 | Renders the error message |
| 2 | Returns null when message is undefined |
| 3 | Returns null when message is empty |

**File:** `ErrorAlert.test.tsx` (1 test)
| # | Test |
|---|------|
| 1 | Renders the error message in a styled container |

**File:** `Delayed.test.tsx` (2 tests)
| # | Test |
|---|------|
| 1 | Does not render children immediately |
| 2 | Renders children after the delay (150ms) |

### Shared Component Tests (21 tests, 4 files)

**File:** `Pagination.test.tsx` (7 tests)
| # | Test |
|---|------|
| 1 | Returns null for single page |
| 2 | Renders page buttons for multiple pages |
| 3 | Disables previous button on first page |
| 4 | Disables next button on last page |
| 5 | Calls onPageChange when clicking a page number |
| 6 | Calls onPageChange with next page on next click |
| 7 | Shows ellipsis for large page counts |

**File:** `SortableHeader.test.tsx` (6 tests)
| # | Test |
|---|------|
| 1 | Renders label |
| 2 | Shows arrow when active (desc) |
| 3 | Shows arrow when active (asc) |
| 4 | Hides arrow when inactive |
| 5 | Toggles order on click |
| 6 | Defaults to asc on first click when inactive |

**File:** `StatusTabs.test.tsx` (7 tests)
| # | Test |
|---|------|
| 1-2 | Renders all tabs for EMPLOYEE and ADMIN |
| 3-4 | Returns null for MANAGER and FINANCE |
| 5 | Highlights active tab |
| 6 | Calls onChange with status on tab click |
| 7 | Calls onChange with undefined on All click |

**File:** `AttachmentUpload.test.tsx` (2 tests)
| # | Test |
|---|------|
| 1 | Calls onUpload for valid file |
| 2 | Shows error for file larger than 5MB |

---

## Coverage Map

### By Feature

| Feature             | Backend | Frontend | Total   |
| ------------------- | ------- | -------- | ------- |
| Authentication      | 7       | 2        | 9       |
| User Management     | 6       | 1        | 7       |
| Category Management | 8       | 1        | 9       |
| Reimbursement CRUD  | 4       | 4        | 8       |
| Status Transitions  | 6       | —        | 6       |
| Permissions/RBAC    | 3       | 21       | 24      |
| List Filtering      | 3       | —        | 3       |
| Pagination/Sorting  | 4       | 13       | 17      |
| Stats/Dashboard     | 5       | —        | 5       |
| File Upload         | 9       | 2        | 11      |
| Attachments         | 6       | —        | 6       |
| Invalid Transitions | 2       | —        | 2       |
| Access Restrictions | 5       | —        | 5       |
| UI Components       | —       | 19       | 19      |
| Form Validation     | —       | 5        | 5       |
| Confirm Dialogs     | —       | —        | — \*    |
| **Total**           | **68**  | **66**   | **134** |

\* Confirm dialogs (RejectDialog, ConfirmActionDialog) not testable in jsdom due to Radix UI Portal limitations. Covered by backend integration tests.

### Not Tested (known limitations)

| Component               | Reason                                                         |
| ----------------------- | -------------------------------------------------------------- |
| RejectDialog            | Radix Dialog + Portal → jsdom incompatibility                  |
| ConfirmActionDialog     | Radix Dialog + Portal → jsdom incompatibility                  |
| NewReimbursement route  | Requires route params + API calls                              |
| EditReimbursement route | Requires route params + API + hook mocks                       |
| Data-fetching hooks     | Integration with API, better tested via backend                |
| Breadcrumb hook         | Pure TanStack Router internals                                 |
| Mobile hook             | `useSyncExternalStore` + `matchMedia`, not meaningful in jsdom |
