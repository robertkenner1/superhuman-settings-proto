# Next Steps

## What's Built

- [x] Multi-subdomain architecture (id, home, settings, account, admin, components)
- [x] Iframed settings modal with postMessage communication
- [x] Iframed sign-in with 3 demo accounts (Free, Pro, Enterprise)
- [x] Sign out → signed-out avatar state → sign-in iframe (no page navigation)
- [x] Componentized row system (2 variants, 5 templates)
- [x] Component reference page (`components.localhost`)
- [x] Profile settings (avatar, name, email, password)
- [x] Preferences (dark mode, notifications, language select)
- [x] Security (MFA, account recovery, device sessions)
- [x] Connected accounts (Google, Apple, Microsoft)
- [x] Sign out (all products, individual products)
- [x] Close account flow (consequence disclosure, resolve/export subpages, deletion code + acknowledgment)
- [x] Admin member list with role badges and overflow menus
- [x] Pending invites with resend/revoke actions
- [x] Workspace settings (name, plan, members nav, billing nav, delete nav)

## What's Next

### Admin — Invite Flow (Phase 2)

Triggered by "Invite" button on member list. Inline expanding panel:
- Email input field
- Role selector dropdown (Admin / Member) with permission descriptions
- Default to Member (most restrictive)
- "Send invite" CTA → success toast → new entry in pending list

### Admin — Member Removal + Role Change (Phase 3)

From overflow menu on member rows:
- **Remove from workspace**: confirmation dialog with consequence disclosure ("will lose access to all workspace content, active sessions revoked"), "Remove" as destructive CTA
- **Change role**: inline dropdown replaces role badge, immediate update with toast

### Billing Subdomain (Phases 4–6)

New `billing.localhost` with section tab bar:

**Overview** — Current plan + price + billing cycle, seat usage ("3 of 5 seats used" with progress bar), "Change plan" → inline plan comparison (Free / Pro / Enterprise side-by-side), downgrade = destructive with consequence list, upgrade = additive with prorated preview

**Payment methods** — Active card (type + last 4 + expiry + default badge), update/remove actions, add payment method form, billing email (separate from account email, editable inline)

**Invoices** — Table with date, description, amount, status badges (Paid/Pending/Failed), download per row + bulk download. Failed payment state: alert banner with recovery link to payment section

### Admin — Workspace Settings (Phase 7)

`admin.localhost?section=settings`:
- Workspace name (editable inline)
- Workspace URL/slug (display only)
- Created date (display only)
- Workspace visibility — enterprise only, 3-tier: Private / Organization / Public (default Private)
- "Manage billing" navigation row → `billing.localhost`
- Danger zone: "Transfer ownership" nav row, "Delete workspace" nav row

### Admin — Workspace Deletion (Phase 8)

Reuses the close-account flow pattern:
1. Review screen — consequence list + data export ("all data permanently deleted", "3 members lose access", "billing cancelled immediately")
2. Confirmation — typed workspace name + checkbox acknowledgment + disabled "Delete workspace" button until both conditions met

### Access Denied State (Phase 9)

When a member navigates to an admin-only section via URL:
- "You don't have access to this section"
- Explanation of why (role-based)
- Recovery actions: "Contact admin" + "Back to members"
- Never a dead end

### Polish & Infrastructure

- **Tooltips**: IconButton tooltips not rendering (FloatingPortal scoping issue with ThemeProvider). Needs investigation — tooltips portal to document.body which may lack theme CSS variables despite body having data-gds-theme attributes
- **Inline editing**: Wire up pencil icon click → inline text field for field rows (name, email, workspace name)
- **Toast confirmations**: Add success toasts for invite sent, member removed, role changed, settings updated
- **Responsive**: Settings modal and standalone pages at narrower viewports
- **Dark mode**: Wire up the dark mode toggle to actually switch `data-gds-mode` on body
- **Keyboard navigation**: Tab order through settings rows, Enter to activate clickable rows
- **URL routing for account.localhost**: Section navigation via URL params (`?section=security`, etc.)

## Open Design Questions

- Should the select template (language) use the same small secondary button as other actions, or a larger trigger to signal "this opens a picker"?
- Member row: should the overflow menu be replaced with inline text buttons for single-action cases (e.g., just "Remove" when there's only one action)?
- Workspace deletion: should the typed confirmation be the workspace name or a random phrase?
- Plan comparison view: inline accordion vs side-by-side cards vs full-page takeover?
