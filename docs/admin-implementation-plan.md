# Admin & Billing Subdomains — Implementation Plan

## Current State

`admin.localhost` renders a single `WorkspaceTab` inside a `StandalonePage` wrapper. It shows:
- Workspace name + plan (display rows with placeholder "Update"/"Manage" buttons)
- Flat member list (name + email + role, no actions)
- Billing section (plan, payment method, billing email — display only)
- Delete workspace link (admin only, no-op)

`billing.localhost` does not exist yet.

**What's missing**: section navigation, invite flow, role management, member removal, billing as its own subdomain, workspace deletion flow, role-gated views.

---

## Subdomain Separation

Billing gets its own subdomain to reflect that payments are a distinct concern from workspace admin — in production, billing often lives on a separate service with its own auth scoping (PCI compliance, payment processor isolation, etc.).

| Subdomain | Purpose | Who sees it |
|---|---|---|
| `admin.localhost` | Workspace management: members, roles, settings, deletion | Admin/Owner (members get read-only member list) |
| `billing.localhost` | Payment methods, invoices, plan management, seat usage | Admin/Owner only |

Cross-links between them:
- `admin.localhost` Settings section links to `billing.localhost` for plan/payment management
- `billing.localhost` links back to `admin.localhost` for member/seat context
- Both share the same `?team=` and `?plan=` URL params

---

## Data Model Changes

### Expand `Team` interface
```ts
interface Team {
  id: string
  name: string
  planLabel: string
  role: 'owner' | 'admin' | 'member'  // add owner tier
}
```

### New `Member` interface
```ts
interface Member {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'pending'
  avatarInitials: string
}
```

### New `Invite` interface
```ts
interface Invite {
  id: string
  email: string
  role: 'admin' | 'member'
  sentAt: string        // e.g. "2 days ago"
  sentBy: string        // member name
}
```

### Demo data
Richer member sets per team:

**Bobby's Workspace (t1)**
- Bobby Kenner — Owner, active
- 1 pending invite

**Acme Corp (t2)**
- Alice Chen — Owner, active
- Bobby Kenner — Member, active
- Dan Park — Admin, active
- 2 pending invites

---

## Section Architecture

### admin.localhost

Route via URL param: `admin.localhost?team=t1&section=members`

| Section | URL param | Admin | Member |
|---|---|---|---|
| Members | `members` | Full control | View only |
| Settings | `settings` | Full control | View only |
| Delete workspace | `delete` | Full flow | Hidden |

Default section: `members`

Section navigation: lightweight tab bar below the back-nav breadcrumb. Horizontal tabs: **Members**, **Settings**. Delete is accessed from within Settings (navigation row), not a top-level tab. A "Billing" link in Settings navigates to `billing.localhost`.

### billing.localhost

Route via URL param: `billing.localhost?team=t1&section=overview`

| Section | URL param | Admin | Member |
|---|---|---|---|
| Overview | `overview` | Full | Denied |
| Payment methods | `payment` | Full | Denied |
| Invoices | `invoices` | Full | Denied |

Default section: `overview`

Section navigation: same tab bar pattern. Horizontal tabs: **Overview**, **Payment methods**, **Invoices**.

---

## Phase 1: Member List

Replaces the current flat member display. Applies Northbase heuristics directly.

### Layout
- **Section header**: "Members" heading + member count + "Invite" button (primary CTA)
- **Tabs**: Members (default) / Pending
- **Member rows**: Avatar initials + name + email + role badge + overflow menu

### Member row
```
[AV]  Alice Chen              Admin     [...]
      alice@acme.com
```

- Avatar: same style as profile-menu-avatar (initials in colored square)
- Role: text badge, subdued color
- Overflow menu (admin only): "Change role", "Remove from workspace"
- Owner row: no overflow menu, role shows "Owner" with no actions

### Tabs
- **Members tab**: all active members, sorted owner-first then alphabetical
- **Pending tab**: pending invites with "Resend" and "Revoke" actions, shows who sent and when

### Role-gated behavior
- **Admin/Owner viewing**: sees overflow menus, "Invite" button, Pending tab
- **Member viewing**: sees member list (read-only), no overflow, no Invite, no Pending tab

### Heuristics applied
- "Invite" not "Add" (8/10 systems)
- Tabbed interface (Members / Pending)
- Role displayed inline on every row
- "Remove" for destructive action verb (6/9 systems)

---

## Phase 2: Invite Flow

Triggered by "Invite" button on member list. Opens inline (not a separate page).

### Layout
Expanding panel below the Invite button, or a card that pushes content down:

```
┌─────────────────────────────────────────────┐
│  Email address                              │
│  ┌────────────────────────────────────────┐ │
│  │ Enter email addresses                  │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  Role                                       │
│  ┌──────────────┐                           │
│  │ Member     ▾ │  ← defaults to Member     │
│  └──────────────┘                           │
│  Can view workspace content and collaborate │
│                                             │
│              [Cancel]  [Send invite]        │
└─────────────────────────────────────────────┘
```

### Role selector
Dropdown with inline descriptions (Northbase "inline descriptions" model):

- **Admin** — Can manage members, billing, and workspace settings
- **Member** — Can view workspace content and collaborate

Default: **Member** (most restrictive — Northbase heuristic)

### After sending
- Show success toast: "Invite sent to alice@acme.com"
- New entry appears in Pending tab
- Collapse the invite panel

### Heuristics applied
- Email input as primary field
- Role selector with permission descriptions
- Default to most restrictive role
- Frame as "inviting" (CTA: "Send invite")

---

## Phase 3: Member Removal

Triggered from overflow menu → "Remove from workspace".

### Confirmation dialog
Inline confirmation replacing the member row, or a focused card:

```
┌─────────────────────────────────────────────┐
│  Remove Dan Park?                           │
│                                             │
│  Dan will immediately lose access to all    │
│  workspace content and active sessions      │
│  will be revoked.                           │
│                                             │
│              [Cancel]  [Remove]             │
└─────────────────────────────────────────────┘
```

### Behavior
- "Remove" as the destructive CTA (Northbase: 6/9 systems)
- Consequence disclosure: what happens to their access
- After removal: member disappears from list, toast confirms "Dan Park removed from workspace"

### Role change flow
Overflow menu → "Change role" → inline dropdown appears on the row replacing the current role badge. Select new role → immediate update with toast confirmation.

### Heuristics applied
- Two-step confirmation with consequence headline
- "Remove" verb for destructive action
- Consequence disclosure before action

---

## Phase 4: Billing Subdomain — Overview

`billing.localhost?team=t1&section=overview`. Only accessible to admin/owner.

### Layout

**Current plan**
- Plan name + price + billing cycle
- Seat count: "3 of 5 seats used" with progress bar
- "Change plan" button → plan comparison view
- Next billing date

**Plan comparison view** (inline, replaces overview content)
- Current plan highlighted
- Side-by-side: Free / Pro / Enterprise
- Per-plan: price, seat limit, feature list
- "Downgrade" shown with consequence disclosure ("You'll lose access to: ...")
- "Upgrade" shown with prorated cost preview

### Heuristics applied
- Plan changes treated as consequential — show what changes, who's affected
- Downgrade = destructive, requires confirmation with consequence list
- Upgrade = additive, lighter confirmation (just a summary + confirm)

---

## Phase 5: Billing Subdomain — Payment Methods

`billing.localhost?team=t1&section=payment`

### Layout

**Active payment method**
- Card type icon + last 4 digits + expiration + "Default" badge
- "Update" and "Remove" actions
- Remove requires confirmation: "Your subscription will be paused if no payment method is on file"

**Add payment method**
- "Add payment method" button
- Inline form: card number, expiry, CVC, billing address (all placeholder inputs)
- "Save" / "Cancel"

**Billing email**
- Current billing email displayed
- "Update" inline edit (same pencil icon pattern as profile)
- Separate from the user's account email — make this distinction clear

### Heuristics applied
- Consequence disclosure on removal (subscription impact)
- Clear separation: billing email ≠ account email

---

## Phase 6: Billing Subdomain — Invoices

`billing.localhost?team=t1&section=invoices`

### Layout

**Invoice table**
| Date | Description | Amount | Status | |
|---|---|---|---|---|
| Jan 1, 2026 | Pro — 3 seats | $30.00 | Paid | Download |
| Dec 1, 2025 | Pro — 3 seats | $30.00 | Paid | Download |
| Nov 1, 2025 | Pro — 2 seats | $20.00 | Paid | Download |
| Oct 15, 2025 | Pro — upgrade from Free | $10.00 | Paid | Download |

- Status badges: Paid (green), Pending (yellow), Failed (red)
- Download icon per row → downloads PDF (placeholder)
- "Download all" bulk action at top

**Failed payment state**
When most recent invoice is Failed:
- Alert banner at top: "Your last payment failed. Update your payment method to avoid service interruption."
- Link to `?section=payment`
- Recovery path, not a dead end (Northbase heuristic)

### Heuristics applied
- Recovery path on failed payment — link directly to fix
- Clear status indicators
- Bulk action for common need (download all for accounting)

---

## Phase 7: Workspace Settings

Accessed via `admin.localhost?team=t1&section=settings`. Admin/owner: full control. Member: read-only.

### Layout

**Workspace info**
- Workspace name — editable inline (pencil icon, same pattern as profile)
- Workspace URL/slug — display only
- Created date — display only

**Workspace visibility** (enterprise only)
- 3-tier model: Private (invite only) / Organization (anyone in org) / Public
- Default: Private (most restrictive)
- Radio group or segmented control with descriptions

**Billing link**
- "Manage billing" — navigation row → `billing.localhost?team=t1`
- Shows current plan inline as description: "Pro — $10/month per seat"

**Danger zone**
- "Transfer ownership" — navigation row → separate flow (future)
- "Delete workspace" — navigation row → delete flow

### Heuristics applied
- 3-tier visibility model (Private > Org > Public)
- Default to most restrictive
- Destructive actions separated into "danger zone"
- Cross-subdomain link to billing is a navigation row, not buried

---

## Phase 8: Workspace Deletion

Reuses the close-account flow pattern already built. Accessed from Settings danger zone.

### Flow
1. **Review screen**: consequence list + data export options
   - "All workspace data will be permanently deleted"
   - "3 members will lose access"
   - "Billing will be cancelled immediately"
   - Export option for workspace data
2. **Confirmation screen**: typed workspace name + checkbox acknowledgment
   - "Type WORKSPACE_NAME to confirm"
   - Checkbox: "I understand this action is permanent"
   - "Delete workspace" button (disabled until both conditions met)

### Heuristics applied
- Full consequence screen before confirmation
- Typed confirmation for irreversible actions
- Recovery messaging: "You can export your data before deleting"

---

## Phase 9: Access Denied State

When a member navigates to an admin-only section (billing subdomain, admin settings, delete) directly via URL.

### Layout
```
┌─────────────────────────────────────────────┐
│  You don't have access to this section      │
│                                             │
│  Billing settings are only available to     │
│  workspace admins. Contact an admin to      │
│  request access or changes.                 │
│                                             │
│  [Contact admin]  [Back to members]         │
└─────────────────────────────────────────────┘
```

### Heuristics applied
- Recovery path: "Contact admin" + navigation back (never a dead end)
- Explain reason for denial
- Suggest alternative action

---

## File Changes

### `vite.config.ts`
- Add `billing.localhost` to `allowedHosts`

### `src/App.tsx`
- Expand `Team` interface with `owner` role
- Add `Member`, `Invite`, and `Invoice` interfaces + demo data
- Add `billing` case to subdomain router in `App`
- Replace `WorkspaceTab` with section-routed `AdminPage`:
  - `AdminMembersSection` — member list + tabs + invite flow
  - `AdminSettingsSection` — workspace config + danger zone + billing cross-link
  - `AdminDeleteSection` — workspace deletion flow (reuse close-account pattern)
- New `BillingPage` with section routing:
  - `BillingOverviewSection` — current plan + seat usage + plan comparison
  - `BillingPaymentSection` — payment methods + billing email
  - `BillingInvoicesSection` — invoice table + failed payment alert
- `AdminAccessDenied` component — shared across admin + billing for role-gated sections
- `SectionTabBar` component — shared horizontal tab bar for both subdomains

### `src/index.css`
- Member row styles (avatar + name + role badge layout)
- Invite panel styles
- Removal confirmation card styles
- Section tab bar styles
- Role badge styles
- Access denied state styles
- Invoice table styles + status badges
- Plan comparison card styles
- Payment method card styles
- Failed payment alert banner styles

---

## Implementation Order

| Phase | Subdomain | What | Depends on |
|---|---|---|---|
| 1 | admin | Member list + tabs | Data model changes |
| 2 | admin | Invite flow | Phase 1 |
| 3 | admin | Member removal + role change | Phase 1 |
| 4 | billing | Overview + plan comparison | Subdomain setup |
| 5 | billing | Payment methods | Subdomain setup |
| 6 | billing | Invoices + failed payment state | Subdomain setup |
| 7 | admin | Workspace settings + billing cross-link | Phases 4-6 (billing exists to link to) |
| 8 | admin | Workspace deletion | Phase 7 (accessed from settings) |
| 9 | both | Access denied state | Phases 4-7 (guards admin-only sections) |

Phases 1-3 are the core member management loop.
Phases 4-6 are the billing subdomain (can be built in parallel with 1-3).
Phases 7-8 are admin settings + deletion.
Phase 9 is polish.

---

## Heuristic Checklist

Before shipping each phase, verify against Northbase anti-patterns:

- [ ] No dead-end screens — every state has a next action
- [ ] "Invite" not "Add" for member inclusion
- [ ] "Remove" not "Deactivate" for member removal
- [ ] Roles always show description text, not just name
- [ ] Destructive actions have two-step confirmation
- [ ] Consequence disclosure before every destructive action
- [ ] Default to most restrictive option (Member role, Private visibility)
- [ ] Recovery messaging on irreversible actions
