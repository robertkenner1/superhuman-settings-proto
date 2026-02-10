# Superhuman Settings Prototype

Multi-subdomain account settings prototype with a componentized row system, plan-based auth, and iframed modal architecture. Built with React and the Grammarly Origin design system (Superhuman theme).

[Watch the walkthrough on Loom](https://www.loom.com/share/d271afa2955b4048b66b3ccec9000135)

---

## Architecture

The prototype simulates a production multi-subdomain setup where different concerns live on different subdomains. The settings UI is iframed into the main app shell, and sign-in is also iframed on sign-out — no full page navigations between subdomains during normal use.

| Subdomain | Purpose |
|---|---|
| `home.localhost` | Main app shell — nav bar, profile menu, iframe host for settings and sign-in |
| `settings.localhost` | Settings UI (sidebar + content panels), designed to be iframed |
| `id.localhost` | Sign-in page, works standalone or iframed into home |
| `account.localhost` | Standalone account settings pages (deep-linkable) |
| `admin.localhost` | Workspace admin — member list, invites, role management |
| `components.localhost` | Component reference showing all row templates |

Cross-subdomain communication uses `postMessage` for iframe events (`close`, `signout`, `signin`) and URL params (`?plan=`) for state persistence.

## Demo Accounts

Three accounts map to three plan tiers. Pick one on the sign-in page to see how the UI adapts:

| Email | Plan | What you see |
|---|---|---|
| `bobby@gmail.com` | Free | No workspaces, account settings only |
| `bobby@kenner.com` | Pro | Bobby's Workspace (admin), member management, billing links |
| `bobby@acme.com` | Enterprise | Bobby's Workspace + Acme Corp (as member), multi-workspace sidebar |

Sign out stays in the app (avatar switches to signed-out state). Click the avatar to open sign-in as an iframed modal and switch accounts.

## Row System

Every settings row is built from **2 variants** and **5 templates**. The component reference at `components.localhost` shows all of them.

### Variants

| Variant | Structure | Behavior |
|---|---|---|
| `clickable` | Label + Description (left) / Value + Icon (right) | Whole row is the click target |
| `action` | Label + Description (left) / Interaction slot (right) | Row is static, interaction is in the slot |

### Templates

| Template | Variant | Right side | Used for |
|---|---|---|---|
| **Edit** | `clickable` | Value + pencil icon | Name, email, password, avatar |
| **Navigate** | `clickable` | Caret icon | Members, billing, close account, delete workspace |
| **Button** | `action` | Text button | Revoke, connect, manage, sign out, set up |
| **Toggle** | `action` | Switch | Dark mode, email notifications |
| **Select** | `action` | Button + dropdown menu | Language |
| **Info** | `action` | Nothing | Current session (display only) |

Edit and Navigate are the same `clickable` variant — the application just swaps the icon (pencil vs caret). Button, Toggle, Select, and Info are all the `action` variant with different content in the `actions` slot.

### Layout rules

- **Left side**: Always label + optional description (stacked below)
- **Right side**: Always the interaction element only
- Description never moves to the right side — one position, everywhere
- Secondary buttons with borders for clear affordance (accessible to color-blind users)

## Key Design Decisions

**Text buttons over icon buttons for row actions.** Most icons are ambiguous without context (X could mean close, delete, remove, cancel). Text buttons are immediately clear with a single click. Icon buttons are reserved for universally understood icons only (pencil = edit, download arrow = export). See `docs/row-action-patterns.md` for the full tradeoff analysis.

**Overflow menus only for secondary multi-action rows.** The ellipsis menu hides actions behind an extra click. Acceptable for admin-only actions (role changes, backup codes) but not for actions that are the reason the row exists (revoke a session, resend an invite).

**Consequence disclosure before destructive actions.** Close account shows what will happen (deactivation, workspace removal, 30-day deletion window) before asking for confirmation. Workspace deletion (planned) follows the same pattern.

**Default to most restrictive.** Invite flow defaults to Member role, not Admin. Workspace visibility (planned) defaults to Private.

## Running Locally

```bash
npm install
npm run dev
```

The dev server runs on port 5175. Visit `home.localhost:5175` to start. All subdomains resolve to localhost automatically (no `/etc/hosts` edits needed).

## File Structure

```
src/
  App.tsx        All components — subdomain router, settings UI, sign-in, admin
  index.css      Custom styles (row layouts, cards, menus, iframe overlays)
  main.tsx       Entry point
docs/
  admin-implementation-plan.md    9-phase plan for admin + billing subdomains
  row-action-patterns.md          Tradeoff analysis for icon vs text vs overflow
  permission-access-control.md    Northbase heuristics for access control UX
```

## Tech Stack

- React 19 + TypeScript
- Vite (multi-subdomain dev server)
- [@grammarly/origin](https://www.npmjs.com/package/@grammarly/origin) component library (Superhuman theme)
