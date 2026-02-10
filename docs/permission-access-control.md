# Permission & Access Control — Design Heuristics

Extracted from [Northbase](https://www.northbase.design/patterns/permissions) pattern library.
152 instances analyzed across 10 enterprise systems (Notion, Slack, Figma, Linear, GitHub, Atlassian, Asana, Airtable, Dropbox, Trello).

---

## Key Stats

- **46%** of permission CTAs are additive (invite, add, send, join, share)
- **8%** are subtractive (remove, cancel, deactivate)
- **"Invite"** dominates member lists: 8 of 10 systems use it over "Add"
- **"Remove"** dominates destructive actions: 6 of 9 systems
- Role complexity ranges from **2 tiers** (Linear) to **8 tiers** (Asana)
- **50%** of systems lack request-access flows
- Invite flows represent **25.7%** of all permission instances

---

## Admin Controls (82 instances)

### Member List
- Standard: table layout + "Invite" CTA + tabbed interface
- Use **"Invite"** rather than "Add" for member inclusion
- Display role assignments inline with descriptions
- Organize by tabs: Active members, Pending invites, Inactive

### Role Model Structures
Three presentation approaches:

| Approach | When to use |
|---|---|
| **Inline descriptions** | Role name with permissions listed below — simple products |
| **Permission matrix** | Grid showing capabilities per role — complex products |
| **Group-based** | Role groupings with hierarchy indicators — team-centric products |

### Member Removal
- Confirmation headline explaining consequences
- Consequence disclosure (data access revocation, workspace removal)
- Explicit confirmation step
- Recovery messaging when applicable

---

## User Flows (70 instances)

### Invite Flow
- Email input field as primary entry point
- Role selector positioned prominently
- Frame around personal email usage (7 of 10 systems)
- Acceptance via email link or in-app notification

### Share Dialogs
- **3-tier visibility model**: Private > Organization > Public
- Default to most restrictive option (5 of 6 systems)
- Link-sharing alongside role-based access
- Explicit visibility tier labeling

### Access Denial
Two camps:
- **Recovery path** (good): "Request access," contact admin, retry, account switching
- **Dead end** (bad): 403 page with no recovery — 3 of 7 systems do this

Account switching visible on 4 of 5 request-access pages.

---

## Decision Frameworks

### Member List
- Table structure with role column
- "Invite" button prominent
- Tabs: Members, Pending, Inactive

### Invite Flow
- Email input as primary field
- Dropdown role selector
- Frame as "inviting" not "adding"

### Share Dialog
- Three clearly labeled tiers with descriptions
- Default to restricted access
- Show current sharing state

### Access Denied
- Provide recovery path when possible
- Offer "contact admin" option
- Suggest account switching
- Explain reason for denial

### Role Definition
- Permission descriptions with each role
- Matrix format for complex permission sets
- Show scope: workspace, project, item-level

---

## Anti-Patterns

### Critical Failures
- Dead-end 403 pages with no recovery (3 of 7 systems)
- Missing request-access flows entirely (5 of 10)
- Roles without descriptive text
- Flat permission models for complex products

### Confusing CTAs
- "Continue" — ambiguous next action
- "Deactivate" — unclear scope
- "Confirm" — passive, unclear consequences

### UI Missteps
- "Add" instead of "Invite"
- Unclear role hierarchies
- Insufficient consequence disclosure on destructive actions
- Missing personal email context in invitations

---

## Applying to Admin Subdomain

Heuristics for `admin.localhost` workspace settings:

1. **Member list**: Table with inline role labels + "Invite" CTA + tabs (Members / Pending)
2. **Role selector**: Show role name + short permission description in dropdown
3. **Removal**: Two-step confirm with consequence disclosure ("Bobby will lose access to all workspace data")
4. **Billing/plan changes**: Treat as destructive — show what changes, who's affected
5. **Workspace deletion**: Full consequence screen + typed confirmation (already implemented in close-account flow — reuse the pattern)
6. **Default to restrictive**: New invites default to "Member" not "Admin"
7. **Recovery paths**: Every denied action should offer a next step, never a dead end
