# Settings Design Language

Rules governing the structure, spacing, and behavior of all settings UI. Every change to the app should be rooted in these rules.

## Spacing

Vertical spacing follows a **2x rule** — each level of containment doubles the gap. Grouping is communicated through density alone, without dividers or decorative borders.

| Level | Token | Pixels | Usage |
|-------|-------|--------|-------|
| Inline | `space-half` | 2 | Label to description within a setting row |
| Detail | `space-1` | 4 | Icon to text, group header label to description |
| Cell | `space-3` | 12 | Row padding inside cards (top/bottom) |
| Group | `space-6` | 24 | Between cards, groups, and content sections |
| Section | `space-12` | 48 | Between major page sections (component reference only) |

**The math:** Cell (12) → Group (24) → Section (48). Each level is 2x the previous.

## Page structure

Every settings page follows this layout:

```
PageTitle
├── [bare card]           ← first group, no header needed
├── ContentSection        ← subsequent groups get a header
│   └── SettingsCard
├── ContentSection
│   └── SettingsCard
└── ...
```

**Rules:**
1. Page gap is always `space-6` (24px) between all top-level elements
2. First group after the title is a bare `SettingsCard` — the title contextualizes it, so a group header would be redundant
3. Every subsequent group uses a `ContentSection` header
4. No consecutive bare cards — if there are multiple groups, the second and beyond must have headers

## Page title

- Default: `<PageTitle title="..." />`
- With action: title and button in a flex row with `space-between`
- Uses `Heading` as h2, variant `heading-small`

## Group header (ContentSection)

- Default: label only (`text-small`, `medium` weight)
- Optional: label + description (`text-small`, `base-subdued`)
- Gap between label and description: `space-1` (4px)
- Gap between header and card: `space-2` (8px)
- Most group headers in practice omit the description — use it only when the label alone isn't clear enough

## Setting row (SettingsRow)

Two variants based on interaction model:

### Clickable (`variant="clickable"`)
- Renders as `<button>` — the entire row is the tap target
- Trailing content: optional value text + icon (caret right for navigation, pencil for edit)
- Full-width row border (edge to edge of card) — reinforces the clickable affordance
- Hover state: `color-background-base-subdued`
- Border radius on first/last child matches card radius

### Action (`variant="action"`)
- Renders as `<div>` — the row itself is not interactive
- Inline controls: Button, Switch, Menu, or static (no action)
- Inset row border (`space-4` from left and right edges) — signals static content
- Only one action is exposed inline; additional actions go to an overflow menu

### Shared
- Label: required, `text-small`
- Description: optional, `text-small`, `base-subdued`
- Gap between label and description: `space-half` (2px)
- Row padding: `space-3` top/bottom, `space-4` left/right

## Card (SettingsCard)

- Border: `1px solid color-border-base-subdued`
- Border radius: `radius-medium`
- Background: `color-background-base-default`
- Box shadow: `0 1px 0 0 color-border-base-subdued` — adds visual weight to the bottom edge
- Overflow: `visible` (so menus can escape the card)

## Row borders

The border treatment differs by variant to create an affordance signal:

| Variant | Left edge | Right edge | Why |
|---------|-----------|------------|-----|
| Clickable | `0` (flush) | `0` (flush) | Full-width border reinforces that the row is a single interactive surface |
| Action | `space-4` (inset) | `space-4` (inset) | Inset border signals the row is a container for controls, not itself a target |

## Actions

| Pattern | Component | When to use |
|---------|-----------|-------------|
| Primary action | `Button` secondary small | Single exposed action (e.g. "Set up", "Manage") |
| Overflow | `IconButton` tertiary small (`DotsThreeHorizontalIcon`) | Additional actions beyond the primary |
| Menu selector | `Button` secondary small + `CaretSmallDownIcon` | Choosing from a list of values |
| Toggle | `Switch` | Binary on/off settings |
| Static | No action | Display-only information |

**Rule:** Only one action is exposed inline per row. If a setting has multiple actions, expose the primary one and put the rest in overflow.

## Interaction states

- **Hover:** `color-background-base-subdued` — used for clickable rows, buttons, menu items
- **Active/pressed:** `neutral-gray-5`
- **Menu trigger while open:** `color-background-base-subdued` (via `aria-expanded="true"`)
- **No custom overrides** on Origin component internals — trust the design system defaults

## Navigation

- Breadcrumb back link: `CaretLargeLeftIcon` + text, styled as a button with underline on hover
- Navigation rows: `CaretLargeRightIcon` as the trailing icon
- Edit rows: `PencilIcon` as the trailing icon, with a value displayed inline

## Component hierarchy

```
Settings page
├── PageTitle
├── SettingsCard (bare first group)
│   └── SettingsRow (clickable | action)
├── ContentSection (group header)
│   └── SettingsCard
│       └── SettingsRow (clickable | action)
└── ContentSection
    └── SettingsCard
        └── SettingsRow (clickable | action)
```

This hierarchy maps directly to the component reference at `components.localhost`.
