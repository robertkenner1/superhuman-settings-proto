# Row Action Patterns — Design Tradeoffs

## The Problem

Settings rows need inline actions, but the right approach depends on the action type. Three candidates were evaluated:

| Pattern | Pros | Cons |
|---|---|---|
| **Icon button** | Compact, no label clutter | Unclear unless icon is universally understood (pencil, download). Ambiguous icons (X, arrows) require tooltips that users may never discover |
| **Overflow menu (ellipsis)** | Clean rows, supports multiple actions, labeled items inside | Extra click to discover and execute. Actions feel hidden — bad for primary or time-sensitive actions |
| **Text button** | Immediately clear, no interpretation needed, single click | Adds visual weight to the row. Can feel cluttered when label + button text compete for attention |

## Decision

Use **text buttons** for list item actions. The clarity tradeoff is worth the slight visual weight.

- A user scanning a device list should immediately see "Revoke" without hovering or clicking
- A pending invite should clearly offer "Resend" and "Revoke" without discovery cost
- The extra click of an overflow menu is a real cost for actions users expect to take frequently

## Pattern Rules

### Icon button — only for universally understood icons
- **Edit (pencil)**: Always clear. Used for inline field editing (name, email, avatar)
- **Export (download arrow)**: Clear in context of data export rows

No other icon buttons are used standalone. If you need a tooltip to explain what the icon does, use a text button instead.

### Text button — for list item actions
- **Revoke** on device sessions
- **Resend** / **Revoke** on pending invites
- **Connect** / **Disconnect** on linked accounts
- **Transfer ownership** / **Set up** / **Manage** on settings rows

Use `variant="secondary" size="small"` for all row-level text buttons.

### Overflow menu (ellipsis) — for multi-action rows where actions are secondary
- **Member rows**: "Change role" and "Remove from workspace" — these are admin-only, less frequent, and having two destructive actions exposed inline would be noisy
- **MFA row** (when enabled): "View backup codes" and "Disable" — secondary to the primary "Manage" button

The ellipsis is appropriate when: (a) there are 2+ actions, (b) the actions are infrequent or admin-only, and (c) a primary button already exists on the row.

### Navigation row — for "go somewhere" actions
- Uses right caret `>` with inline description
- Label on left, description + caret on right
- No buttons — the entire row is the click target

## Why Not Ellipsis Everywhere?

Hiding actions behind a menu trades clarity for cleanliness. This is acceptable for power-user actions (role changes, backup codes) but not for actions that are the *reason* the row exists. A device session row exists so you can revoke it. An invite row exists so you can resend or revoke it. The primary action should be visible.

## Why Not Icon Buttons Everywhere?

Most icons are ambiguous without context. An X could mean close, delete, remove, cancel, or revoke. A circular arrow could mean refresh, retry, undo, or resend. Users shouldn't need to hover and wait for a tooltip to understand what a button does. The pencil icon is a rare exception — it maps to "edit" across virtually every application.
