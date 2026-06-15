# Roles & Permissions Module — UI/UX Design Specification

> **Version:** 1.0  
> **Module Identity:** Purple → Indigo gradient (`from-purple-500 to-indigo-500`)  
> **Target Framework:** React 19 + TypeScript + Tailwind CSS v4  
> **Date:** 2026-06-15

---

## Table of Contents

1. [Color Palette & Module Identity](#1-color-palette--module-identity)
2. [Screen 1: Role Management (`/roles`)](#2-screen-1-role-management-roles)
3. [Screen 2: Permission Registry (`/permissions`)](#3-screen-2-permission-registry-permissions)
4. [Screen 3: User Role Assignment Modal](#4-screen-3-user-role-assignment-modal)
5. [Interaction Behaviors](#5-interaction-behaviors)
6. [Responsive Behavior](#6-responsive-behavior)
7. [Permission-Visibility Rules](#7-permission-visibility-rules)
8. [Data Flow & API Shape](#8-data-flow--api-shape)
9. [Route & Sidebar Integration](#9-route--sidebar-integration)

---

## 1. Color Palette & Module Identity

Each module in the app has a distinct gradient identity. This module uses **Purple → Indigo**.

| Token | Value | Usage |
|-------|-------|-------|
| Module gradient (light) | `from-purple-500 to-indigo-500` | Buttons, active pills, icons |
| Module gradient (text) | `from-purple-600 to-indigo-600` | Page title (bg-clip-text) |
| Module gradient (subtle) | `from-purple-50 to-indigo-50` | Selected row backgrounds |
| Module accent border | `border-purple-500` | Left border on selected items |
| Module shadow | `shadow-purple-500/20` | Shadow on icon badges |
| Checkbox accent | `accent-purple-600` | Permission checkboxes |
| Checkbox rings | `focus:ring-purple-500` | Checkbox focus rings |
| Save button | `from-purple-600 to-indigo-600` | Primary save CTA |
| Danger actions | `from-rose-500 to-red-500` | Delete/remove buttons |
| Pill badge (ALL) | `bg-purple-100 text-purple-700` | Super Admin badge |
| Table header | `bg-purple-50` | Permission group header bg |
| Skeleton shimmer | As per existing pattern | Loading placeholders |

### Module Theme Reference (for consistency)

| Module | Gradient | Page Header |
|--------|----------|-------------|
| Staff | `violet-500 → purple-500` | `from-violet-600 to-purple-600` |
| Centers | `orange-500 → amber-500` | `from-orange-600 to-amber-600` |
| **Roles** | **purple-500 → indigo-500** | **`from-purple-600 to-indigo-600`** |
| Evaluation | `emerald-500 → teal-500` | — |
| Classification | `sky-500 → indigo-500` | — |

### Light/Purple Tone Variants

Use for subtle backgrounds and hover states:

```
purple-50   → #faf5ff — Softest bg (e.g., active row, table header)
purple-100  → #f3e8ff — Pill badges, soft icon bg
purple-200  → #e9d5ff — Border on hover
purple-500  → #a855f7 — Primary icon bg, gradient start
purple-600  → #9333ea — Text gradient start, hover states
purple-700  → #7e22ce — Selected text color

indigo-50   → #eef2ff — Alternative bg
indigo-500  → #6366f1 — Gradient end
indigo-600  → #4f46e5 — Text gradient end
```

---

## 2. Screen 1: Role Management (`/roles`)

### 2.1 Page Layout

**Two-panel layout** with a roles sidebar (left) and role detail panel (right).

```
┌──────────────────────────────────────────────────────────────────┐
│  🛡️ Role Management                         [🔍 Search] [+ Add] │
│  Manage system roles and their permissions                       │
├────────────────────────────────┬─────────────────────────────────┤
│                                │                                 │
│  ┌─Roles List (sidebar)─────┐  │  ┌─Role Detail Panel─────────┐  │
│  │                           │  │  │                           │  │
│  │ 🔑 Manager                │  │  │  Role: "Manager"         │  │
│  │   3 users · 12 perms      │  │  │  ┌─Description─────────┐ │  │
│  ├───────────────────────────┤  │  │  │ editable textarea    │ │  │
│  │ 🔑 Evaluator              │  │  │  └──────────────────────┘ │  │
│  │   5 users · 8 perms       │  │  │                           │  │
│  ├───────────────────────────┤  │  │  ▼ Permissions Section    │  │
│  │ 🔑 Staff                  │  │  │  ┌─Categorized groups───┐ │  │
│  │   20 users · 4 perms      │  │  │  │ ☑ Staff Management  │ │  │
│  ├───────────────────────────┤  │  │  │  ├ ☐ View staff     │ │  │
│  │ 🔑 Super Admin            │  │  │  │  ├ ☑ Create staff   │ │  │
│  │   1 user · ALL            │  │  │  │  ├ ☑ Edit staff     │ │  │
│  └───────────────────────────┘  │  │  │  └ ☐ Delete staff   │ │  │
│                                │  │  │                       │ │  │
│                                │  │  │  [💾 Save Permissions]│ │  │
│                                │  │  │                       │ │  │
│                                │  │  │  ▼ Assigned Users     │ │  │
│                                │  │  │  ┌─Users list────────┐│ │  │
│                                │  │  │  │ 👤 Ahmed Ali      ││ │  │
│                                │  │  │  │ 👤 Sara Mohammed  ││ │  │
│                                │  │  │  └────────────────────┘│ │  │
│                                │  │  │  [+ Assign Users]      │ │  │
│                                │  │  │                         │ │  │
│                                │  │  │  [✏️ Edit] [🗑️ Delete] │ │  │
│                                │  │  └─────────────────────────┘  │
├────────────────────────────────┴─────────────────────────────────┤
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Specifications

#### 2.2.1 Page Header
```
▸ Title: "🛡️ Role Management" (gradient: from-purple-600 to-indigo-600)
▸ Subtitle: "Manage system roles and their permissions" (text-slate-500 mt-1)
▸ Search input: left icon (magnifying glass), placeholder "Search roles..."
▸ [+ Add Role] button: gradient "from-purple-500 to-indigo-500", left icon "+"
```

**States:**
- **Default:** Shows search input + Add button
- **Empty search:** Dropdown shows "No roles match your search" (same pattern as staff/centers)

#### 2.2.2 Roles List (Left Panel)

```
Width: ~320px (flex-shrink-0)
Scrollable: max-h-[calc(100vh-200px)] overflow-y-auto
Border: border-r border-slate-200
```

**Each role card:**
```
┌──────────────────────────────────────────────────┐
│  🔑 (icon)  Manager                              │
│             3 users · 12 perms                    │
├──────────────────────────────────────────────────┤
│                    ...                            │
└──────────────────────────────────────────────────┘
```

| Part | Spec |
|------|------|
| Icon | Shield/key icon in `w-10 h-10 rounded-xl` badge. Selected: `bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/20`. Default: `bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700` |
| Name | `font-semibold text-sm`. Selected: `text-purple-700`. Default: `text-gray-900` |
| Meta | `text-xs text-gray-400`. Format: `"{n} users · {n} perms"` |
| ALL badge | For Super Admin: `text-[10px] font-medium px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full` saying "ALL" instead of perm count |
| Container | `group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150`. Selected: `bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500`. Hover: `hover:bg-slate-50` |

**States:**

| State | Appearance |
|-------|-----------|
| **Default** | Light bg, purple-100 icon bg, gray text |
| **Hover** | `bg-slate-50` on row |
| **Selected** | Purple-50 gradient bg, purple left border (4px), purple gradient icon bg with white text |
| **Active (click)** | No special state (handled by selection) |
| **Loading** | Skeleton placeholder with shimmer animation (3-4 rows) |
| **Empty** | "No roles found. Create your first role to get started." with an icon + CTA button |
| **Error** | "Failed to load roles. [Retry]" error banner in `bg-red-50` |

**Interaction:**
- Clicking a role card selects it; right panel slides in showing details
- Only one role can be selected at a time
- Search filters the list in real-time as user types

**Skeleton (loading):**
```html
<div class="animate-pulse flex items-start gap-3 px-4 py-3">
  <div class="w-10 h-10 rounded-xl bg-slate-200" />
  <div class="flex-1 space-y-2">
    <div class="h-4 bg-slate-200 rounded w-24" />
    <div class="h-3 bg-slate-200 rounded w-32" />
  </div>
</div>
```

#### 2.2.3 Role Detail Panel (Right Panel)

A `Card variant="elevated" padding="lg"` that fills the remaining space.

**2.2.3.1 Role Name & Description**

```
┌─ Header ─────────────────────────────────────────────┐
│  Role Name (h2, text-xl font-bold)  [✏️ Edit] [🗑️ ] │
│  ┌─Description (editable textarea)─────────────────┐ │
│  │  Manages staff and evaluations                  │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Role name | `text-xl font-bold text-gray-900` — static text; clicking ✏️ turns it into an inline input |
| Edit icon | `p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors` |
| Delete icon | `p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors` |
| Description textarea | `w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20` rows=2 resize-none. When empty: placeholder "Describe this role's purpose..." |

**Inline Edit Mode for Role Name:**
When user clicks ✏️ on the name:
- The name text becomes an `Input` field (`text-xl font-bold`)
- A confirmation checkmark and cancel X appear next to it
- Editing description is always in the textarea (no inline toggle needed)

**Delete Confirmation:**
Clicking 🗑️ opens a modal:
```
┌───────────────────────────────────────────┐
│  ✕  Delete Role                           │
├───────────────────────────────────────────┤
│  Are you sure you want to delete          │
│  <strong>"Manager"</strong>?              │
│                                           │
│  This action cannot be undone. {n} users  │
│  currently have this role.                │
├───────────────────────────────────────────┤
│  [Cancel]  [🗑️ Delete Role] (danger btn)  │
└───────────────────────────────────────────┘
```

**2.2.3.2 Permissions Section**

```
▼ Permissions
┌───────────────────────────────────────────────────────┐
│  ☑ Staff Management (master checkbox)                │
│  ├ ☐ staff.view        View staff list and details   │
│  ├ ☑ staff.create      Create new staff members       │
│  ├ ☑ staff.edit        Edit existing staff members    │
│  └ ☐ staff.delete      Delete staff members           │
│                                                       │
│  ☑ Centers (master checkbox)                          │
│  ├ ☐ centers.view      View centers                   │
│  ├ ☐ centers.create    Create centers                 │
│  └ ☐ centers.edit      Edit centers                   │
│                                                       │
│  ☐ Evaluations (master checkbox - unchecked)          │
│  └ ...                                                │
│                                                       │
│  [💾 Save Permissions]                                │
└───────────────────────────────────────────────────────┘
```

**Categorized Permission Group:**
```
┌─ Group Card ──────────────────────────────────────────┐
│  ☐ [Master Checkbox]  Staff Management  (5 perms)    │
│  ┌─ Permission Items ───────────────────────────────┐ │
│  │ ☐ staff.view           View staff list & details │ │
│  │ ☑ staff.create         Create new staff members  │ │
│  │ ☑ staff.edit           Edit existing staff       │ │
│  │ ☐ staff.delete         Delete staff members      │ │
│  │ ☑ staff.export         Export staff data         │ │
│  └──────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Group card | `border border-slate-200 rounded-xl overflow-hidden` |
| Group header | `flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100` |
| Master checkbox | Standard `Checkbox` component with `accent-purple-600`. When toggled, checks/unchecks all children |
| Master label | `text-sm font-semibold text-gray-800` |
| Permission count | `text-xs text-gray-400` — shows "({n} perms)" |
| Permission item | `flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50/30 transition-colors border-t border-slate-50` |
| Item checkbox | Standard `Checkbox`, accent purple, `w-4 h-4` |
| Item label | `text-sm text-gray-700` |
| Item tooltip | `title` attr or a small info icon that shows full description on hover |
| Indent | Permission items indented with `ml-8` (or `pr-8` for RTL) |

**Master Checkbox Logic:**
- **Indeterminate state:** When some (but not all) children are checked, the master checkbox shows an indeterminate state (dash). HTML: `ref.indeterminate = true`
- **Checked:** All children are checked
- **Unchecked:** No children are checked

**Save Permissions Button:**
```
<Button
  variant="gradient"
  gradient="from-purple-600 to-indigo-600"
  leftIcon={<save icon>}
  isLoading={saving}
>
  Save Permissions
</Button>
```

- Positioned below the last permission group
- Disabled when no changes have been made (compare original vs current state)
- Shows a toast "Permissions updated successfully" on success
- Shows error toast with message on failure

**2.2.3.3 Assigned Users Section**

```
▼ Assigned Users
┌───────────────────────────────────────────────────────┐
│  👤 Ahmed Ali · ahmed@example.com                     │
│  👤 Sara Mohammed · sara@example.com                  │
│  👤 Omar Hassan · omar@example.com                    │
│                                                       │
│  [+ Assign Users]                                     │
└───────────────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Section title | Same pattern as permissions — `text-sm font-semibold text-gray-800 mb-3` |
| User row | `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors` |
| Avatar icon | `w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 flex items-center justify-center text-xs font-bold` |
| Name | `text-sm font-medium text-gray-900` |
| Email | `text-xs text-gray-400` |
| [x] Remove | Small `×` button that appears on hover, `text-gray-400 hover:text-red-500` |
| [+ Assign Users] | `Button variant="outline" size="sm"` with a `+` icon. Opens the User Role Assignment modal |

**Empty state:** "No users assigned to this role" with an icon and "[+ Assign Users]" CTA.

**Loading state:** Skeleton rows (3) with animated pulse.

---

## 3. Screen 2: Permission Registry (`/permissions`)

### 3.1 Page Layout

A read-only reference page for Super Admins to see all available permissions in the system.

```
┌──────────────────────────────────────────────────────────────┐
│  🔑 Permission Registry              [🔍 Filter permissions] │
│  All available system permissions (managed via CLI)           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  📋 Staff Management                                         │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Permission Key           │ Description                   │ │
│  ├──────────────────────────┼───────────────────────────────┤ │
│  │ staff.view               │ View staff list and details  │ │
│  │ staff.create             │ Create new staff members     │ │
│  │ staff.edit               │ Edit existing staff members   │ │
│  │ staff.delete             │ Delete staff members          │ │
│  │ staff.export             │ Export staff data             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  📋 Centers                                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Permission Key           │ Description                   │ │
│  ├──────────────────────────┼───────────────────────────────┤ │
│  │ centers.view             │ View centers list             │ │
│  │ ...                     │ ...                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  📋 Evaluations                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ...                                                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Component Specifications

**Page Header:**
- Title: "🔑 Permission Registry" — gradient `from-purple-600 to-indigo-600`
- Subtitle: "All available system permissions (managed via CLI)"
- Search input: filters permissions across all groups (placeholder "Filter permissions...")

**Permission Group:**
```
▸ Section header:
  📋 Staff Management (badge: "{n} permissions")

▸ Table (read-only):
  ┌──────────────────────────┬───────────────────────────────────┐
  │ staff.view               │ View staff list and details       │
  │ staff.create             │ Create new staff members          │
  └──────────────────────────┴───────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Group header | `flex items-center gap-2 text-sm font-semibold text-gray-800 mt-6 mb-2` |
| Badge | `text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full` |
| Table wrapper | `bg-white border border-slate-200 rounded-xl overflow-hidden` |
| Table header row | `bg-purple-50 text-xs font-semibold text-slate-500 uppercase tracking-wider` |
| Key column | `font-mono text-sm text-gray-800 px-4 py-3` |
| Description column | `text-sm text-gray-500 px-4 py-3` |
| Row hover | `hover:bg-slate-50` |
| Striped rows | `even:bg-slate-50/50` |

**Search behavior:**
- As user types, filter all permission rows across all groups
- Groups that have no matching permissions get `hidden`
- Show a "No permissions match your search" empty state if all filtered out

**Edge cases:**
- **Empty registry:** "No permissions registered. Permissions are managed via CLI." with info icon
- **Loading:** Skeleton table (3 groups with 4 rows each)
- **Error:** "Failed to load permissions. [Retry]" error banner

---

## 4. Screen 3: User Role Assignment Modal

### 4.1 Layout

Opened by clicking "[+ Assign Users]" in the role detail panel.

```
┌────────────────────────────────────────────────┐
│  ✕  Assign Users to "Manager"                  │
├────────────────────────────────────────────────┤
│                                                │
│  Select users to assign this role:             │
│                                                │
│  ┌────────────────────────────────────────────┐│
│  │ 🔍 Search users by name or email...        ││
│  └────────────────────────────────────────────┘│
│                                                │
│  ☑ Ahmed Ali · ahmed@example.com              │
│  ☐ Sara Mohammed · sara@example.com           │
│  ☑ Omar Hassan · omar@example.com             │
│  ☐ Fatima Al-Saud · fatima@example.com        │
│  ...                                           │
│                                                │
│  [Cancel]  [💾 Save Assignments]              │
└────────────────────────────────────────────────┘
```

### 4.2 Component Specifications

**Modal:**
```
<Modal isOpen={showAssignModal} onClose={handleClose} size="lg">
```

| Element | Spec |
|---------|------|
| Title | "Assign Users to \"{roleName}\"" |
| Description | "Select users to assign this role:" — `text-sm text-gray-500` |
| Search input | Full width, `leftIcon` magnifying glass, placeholder "Search users by name or email..." |
| User list | `max-h-80 overflow-y-auto space-y-1` |
| User row | `flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all cursor-pointer` |
| Checkbox | `accent-purple-600 w-4 h-4` — pre-checked for currently assigned users |
| Avatar | `w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 flex items-center justify-center text-xs font-bold` |
| Name | `text-sm font-medium text-gray-900` |
| Email | `text-xs text-gray-400 truncate` |
| Footer | Standard `ModalFooter` with Cancel (outline) + Save (gradient from-purple-600 to-indigo-600) |

**States:**

| State | Appearance |
|-------|-----------|
| **Loading users** | Skeleton list (6 rows) with pulse animation |
| **Empty search** | "No users match your search" with icon |
| **No users** | "No users available to assign. All users already have this role." |
| **Selecting** | Checkbox toggles; parent row highlights on check |
| **Saving** | Save button shows spinner + disabled |
| **Success** | Toast "Users assigned successfully" + modal closes |
| **Error** | Toast "Failed to assign users" with error message |
| **All selected** | All rows checked; save is active |
| **None selected** | Save button is disabled |

**Behavior:**
- Currently assigned users are pre-checked when modal opens
- Only show users who are NOT already assigned? **No** — show all users, pre-check assigned ones. This allows un-assigning users too.
- Search filters the user list in real-time
- Clicking the row (anywhere) toggles the checkbox
- Changes are tracked as a diff — only changed assignments are sent to the API?

**Data sent on save:** `{ role_id: number, user_ids: number[] }` (full list of assigned user IDs).

---

## 5. Interaction Behaviors

### 5.1 Global Interaction Patterns

| Action | Behavior |
|--------|----------|
| **Button hover** | `hover:-translate-y-0.5 hover:shadow-lg` transition (existing pattern) |
| **Button active** | `active:scale-95` transition (existing pattern) |
| **Button disabled** | `opacity-50 cursor-not-allowed` |
| **Click outside** | Close any open dropdown/menu (existing pattern using `mousedown` listener) |
| **Escape key** | Close dropdown, modal, or deselect |
| **Enter key** | Submit form, confirm action |
| **Arrow keys** | Navigate within dropdown lists |
| **Tab** | Standard focus order through form elements |
| **Focus visible** | `focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2` on all interactive elements |

### 5.2 Role List Interactions

| Action | Behavior |
|--------|----------|
| **Click role** | Selects it; right panel loads detail |
| **Search typing** | Filters list live (debounced 300ms) |
| **Clear search** | X button in search input resets to full list |
| **Role selected + search** | When a role is selected and user types in search, the selection stays but the list filters; if the selected role is filtered out, keep it visible at top with a note "current selection (hidden by filter)"? Actually, follow staff pattern — don't filter the selected item out of view |
| **Add role click** | Opens "Create Role" modal (minimal form: name + description) |
| **Empty list + add** | Shows empty state; CTA button to create first role |

### 5.3 Permission Checkbox Interactions

| Action | Behavior |
|--------|----------|
| **Check individual** | Toggle single permission; updates master to indeterminate if partial |
| **Check master** | Check/uncheck all children |
| **Hover permission** | Show tooltip with full description of what the permission allows |
| **Unsaved changes** | Show a small "You have unsaved changes" indicator (dot or banner) |
| **Navigate away with unsaved** | Show a confirmation prompt "You have unsaved changes. Discard?" |
| **Save success** | Toast "Permissions updated successfully" + clear dirty state |
| **Save error** | Toast with error + keep dirty state so user can retry |

### 5.4 Modal Interactions

| Modal | Open trigger | Close triggers | Behavior |
|-------|-------------|----------------|----------|
| Create Role | [+ Add] button | ✕, Cancel, Escape, backdrop click | Small modal: name + description fields |
| Delete Role | 🗑️ in detail panel | ✕, Cancel, Escape, backdrop click | Confirmation with user count warning |
| Assign Users | [+ Assign Users] | ✕, Cancel, Escape, backdrop click | Multi-select with search |
| Role Form | [+ Add] or [✏️ Edit] | ✕, Cancel, Escape, backdrop click | Simple form: name, description |

### 5.5 Create/Edit Role Modal

```
┌─────────────────────────────────────────┐
│  ✕  {Create|Edit} Role                  │
├─────────────────────────────────────────┤
│                                         │
│  Role Name                              │
│  ┌─────────────────────────────────────┐│
│  │ e.g., Department Head               ││
│  └─────────────────────────────────────┘│
│                                         │
│  Description                            │
│  ┌─────────────────────────────────────┐│
│  │ Describe this role's purpose...    ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  [Cancel]  [💾 {Create|Save} Role]      │
└─────────────────────────────────────────┘
```

**Validation:**
- Role name: required, max 255 chars, unique
- Description: optional, max 500 chars

### 5.6 Transition & Animation

| Element | Animation |
|---------|-----------|
| Roles list → detail panel | `animate-fade-in` when detail panel mounts |
| Checkbox toggle | Instant (no animation) |
| Modal open | Fade in overlay + scale up content |
| Toast appear | Slide in from right |
| Role list items | No reorder animation (simple rerender) |
| Permission groups | Collapse/expand with `grid-rows-[0fr→1fr]` transition |

---

## 6. Responsive Behavior

### 6.1 Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640px - 1023px | Two-panel but compressed |
| Desktop | 1024px+ | Full two-panel layout |

### 6.2 Mobile Layout (≤ 639px)

```
Roles Management
├─ Search + Add button (full width)
├─ Roles list (full width, as cards)
│  └─ Click a role → navigates to detail (replaces list)
│     ├─ Back button to return to list
│     ├─ Role detail (full width)
│     └─ Permissions / Users / Actions
└─ (no side-by-side panels)
```

**Specifics:**
- Roles list and detail panel stack vertically
- Selecting a role on mobile navigates away from the list (the list is hidden, detail shown)
- A "Back to roles" button/arrow at top of detail panel returns to list
- The two-panel layout is replaced by a "drill-down" navigation pattern
- The search bar stays visible at top on both list and detail views
- Permission groups stack full-width
- All modals take `max-w-lg` to fit mobile viewport (already handled by Modal component)

### 6.3 Tablet Layout (640px - 1023px)

- Panels are side by side but the left panel is narrower (~260px)
- Permission group items may wrap text
- Buttons in detail header stack on smaller tablets
- Grid shows 1 or 2 columns for permission items

### 6.4 Desktop (1024px+)

- Full layout as specified in Section 2
- Left panel ~320px, right panel fills remaining space
- Minimum content width respected

### 6.5 Responsive HTML Strategy

Use Tailwind responsive prefixes:
```html
<!-- Left panel: full width on mobile, fixed width on desktop -->
<div class="w-full lg:w-80 xl:w-96 flex-shrink-0">
</div>

<!-- Two-panel container: column on mobile, row on desktop -->
<div class="flex flex-col lg:flex-row gap-6">
</div>
```

---

## 7. Permission-Visibility Rules

Permission-based UI visibility determines which UI elements are shown/hidden based on the current user's permissions.

### 7.1 Permission to UI Element Mapping

| Backend Permission | Frontend Element Visibility |
|--------------------|---------------------------|
| `roles.view` | See the Roles & Permissions nav item, access `/roles` page |
| `roles.create` | See the [+ Add Role] button, access create modal |
| `roles.edit` | See the [✏️ Edit] button in detail panel, edit name/description |
| `roles.delete` | See the [🗑️ Delete] button in detail panel |
| `roles.assign_permissions` | See permission checkboxes and [💾 Save Permissions] button |
| `roles.assign_users` | See the [+ Assign Users] button and users section |
| `permissions.view` | Access `/permissions` page |
| `roles.manage` | Super Admin-level: see all of the above |

### 7.2 Implementation Pattern

In each component, conditionally render elements based on user permissions:

```tsx
const { user } = useAuthStore();
const can = (permission: string) => user?.permissions?.includes(permission);

// Usage:
{can('roles.create') && <Button onClick={handleCreate}>+ Add Role</Button>}

{can('roles.assign_permissions') && (
  <SavePermissionsButton onClick={handleSave} />
)}

{can('roles.delete') && (
  <Button variant="danger" onClick={handleDelete}>🗑️ Delete</Button>
)}
```

### 7.3 Visibility Rules Table

| UI Element | Required Permission | Behavior if Missing |
|-----------|-------------------|-------------------|
| Sidebar nav item "Roles" | `roles.view` | Hidden entirely |
| `/roles` page route | `roles.view` | Redirect or 403 page |
| `/permissions` route | `permissions.view` | Redirect or 403 page |
| [+ Add Role] button | `roles.create` | Hidden |
| [✏️ Edit] on role name | `roles.edit` | Hidden |
| [🗑️ Delete] on role | `roles.delete` + not own role | Hidden |
| Permission checkboxes | `roles.assign_permissions` | Read-only display (checkboxes disabled) |
| [💾 Save Permissions] | `roles.assign_permissions` | Hidden entirely |
| [+ Assign Users] button | `roles.assign_users` | Hidden |
| [x] Remove user | `roles.assign_users` | Hidden |
| Users section entirely | `roles.assign_users` | Hidden section |
| Permission Registry page | `permissions.view` | Nav item hidden/redirect |

### 7.4 Fallback/Disabled States

Instead of hiding elements entirely, consider showing them in a **disabled/read-only state** if the user has `roles.view` but not `roles.edit`:
- Description textarea becomes `disabled` with `cursor-not-allowed`
- Permission checkboxes become `disabled` and greyed out
- Buttons are hidden (not disabled — hidden, to reduce noise)

This provides transparency about what exists while preventing unauthorized actions.

### 7.5 Edge Case: Super Admin Override

Super Admin users bypass all permission checks — they see everything and can perform all actions. Implementation:
```tsx
const isSuperAdmin = user?.role === 'super_admin';
const can = (permission: string) => isSuperAdmin || user?.permissions?.includes(permission);
```

---

## 8. Data Flow & API Shape

### 8.1 Key API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/roles` | List all roles (with user count, permission count) |
| GET | `/api/roles/{id}` | Get single role with permissions and assigned users |
| POST | `/api/roles` | Create a new role |
| PUT | `/api/roles/{id}` | Update role name / description |
| DELETE | `/api/roles/{id}` | Delete a role |
| PUT | `/api/roles/{id}/permissions` | Update role permissions (send array of permission keys) |
| PUT | `/api/roles/{id}/users` | Update assigned users (send array of user IDs) |
| GET | `/api/permissions` | List all available permissions (grouped) |
| GET | `/api/users` | List users for assignment (filtered, searchable) |

### 8.2 Expected Response Shapes

**GET `/api/roles`**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Manager",
      "description": "Manages staff and evaluations",
      "is_super_admin": false,
      "users_count": 3,
      "permissions_count": 12,
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { "total": 5, "current_page": 1 }
}
```

**GET `/api/roles/{id}`**
```json
{
  "data": {
    "id": 1,
    "name": "Manager",
    "description": "Manages staff and evaluations",
    "is_super_admin": false,
    "permissions": [
      { "key": "staff.view", "description": "View staff list and details", "group": "Staff Management" },
      { "key": "staff.create", "description": "Create new staff members", "group": "Staff Management" }
    ],
    "users": [
      { "id": 10, "name": "Ahmed Ali", "email": "ahmed@example.com", "avatar_url": null }
    ]
  }
}
```

**GET `/api/permissions`**
```json
{
  "data": [
    {
      "group": "Staff Management",
      "permissions": [
        { "key": "staff.view", "description": "View staff list and details" },
        { "key": "staff.create", "description": "Create new staff members" }
      ]
    },
    {
      "group": "Centers",
      "permissions": [
        { "key": "centers.view", "description": "View centers list and details" }
      ]
    }
  ]
}
```

### 8.3 Frontend State Shape (Zustand)

```typescript
// stores/roleStore.ts
interface RoleState {
  roles: Role[];
  selectedRole: Role | null;
  permissions: PermissionGroup[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Actions
  fetchRoles: (params?: { search?: string }) => Promise<void>;
  fetchRoleDetail: (id: number) => Promise<void>;
  fetchPermissions: () => Promise<void>;
  createRole: (data: { name: string; description?: string }) => Promise<Role>;
  updateRole: (id: number, data: { name?: string; description?: string }) => Promise<void>;
  deleteRole: (id: number) => Promise<void>;
  savePermissions: (roleId: number, permissions: string[]) => Promise<void>;
  saveUserAssignments: (roleId: number, userIds: number[]) => Promise<void>;
  clearSelection: () => void;
  clearError: () => void;
}
```

---

## 9. Route & Sidebar Integration

### 9.1 Routes (Add to `App.tsx`)

```tsx
// In App.tsx — new imports:
import { RolesPage } from './pages/roles';
import { PermissionsPage } from './pages/permissions';

// Under protected routes, add:
<Route path="/roles" element={<RolesPage />} />
<Route path="/permissions" element={<PermissionsPage />} />
```

### 9.2 Sidebar Nav Item (Add to `Sidebar.tsx`)

Add a **"Roles & Permissions"** group under the Staff Management section (or as its own section):

```tsx
// After Staff Management group:
{
  type: 'group',
  labelKey: 'nav.rolesAndPermissions',
  color: 'from-purple-500 to-indigo-500',
  icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  children: [
    { path: '/roles', labelKey: 'nav.roles' },
    { path: '/permissions', labelKey: 'nav.permissions' },
  ],
},
```

### 9.3 Translation Keys

Add these to the translation files:

```json
{
  "nav.rolesAndPermissions": "Roles & Permissions",
  "nav.roles": "Role Management",
  "nav.permissions": "Permission Registry",
  "roles.title": "Role Management",
  "roles.subtitle": "Manage system roles and their permissions",
  "roles.search": "Search roles...",
  "roles.addRole": "Add Role",
  "roles.savePermissions": "Save Permissions",
  "roles.assignUsers": "Assign Users",
  "roles.editRole": "Edit Role",
  "roles.deleteRole": "Delete Role",
  "roles.deleteConfirm": "Are you sure you want to delete \"{name}\"?",
  "roles.deleteWarning": "{n} users currently have this role.",
  "roles.noRoles": "No roles found. Create your first role to get started.",
  "roles.noRolesSearch": "No roles match your search",
  "roles.emptyDescription": "Describe this role's purpose...",
  "roles.permissionsSection": "Permissions",
  "roles.usersSection": "Assigned Users",
  "roles.noUsers": "No users assigned to this role",
  "permissions.title": "Permission Registry",
  "permissions.subtitle": "All available system permissions (managed via CLI)",
  "permissions.filter": "Filter permissions...",
  "permissions.noResults": "No permissions match your search",
  "assignUsers.title": "Assign Users to \"{role}\"",
  "assignUsers.search": "Search users by name or email...",
  "assignUsers.noResults": "No users match your search",
  "assignUsers.save": "Save Assignments"
}
```

---

## Appendix A: Reusable Component Patterns

These are existing patterns from the codebase to replicate for this module:

### A.1 Page Header Pattern
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
      Role Management
    </h1>
    <p className="text-slate-500 mt-1">Manage system roles and their permissions</p>
  </div>
  <div className="flex gap-2">
    {/* Action buttons */}
  </div>
</div>
```

### A.2 Searchable Dropdown Pattern
Same as Staff + Centers pages — uses `Input` with left magnifying glass icon + absolute positioned dropdown list. Uses `useRef` + `mousedown` listener for click-outside.

### A.3 Detail Panel Pattern
Same as Staff `DetailPanel` — uses `Card variant="elevated" padding="lg"` with `animate-fade-in`.

### A.4 Modal Pattern
Uses `Modal` → `ModalHeader` → `ModalContent` → `ModalFooter` components.

### A.5 Error Banner Pattern
```tsx
{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
    <p className="text-red-600">{error}</p>
    <button onClick={clearError} className="text-red-500 hover:text-red-700">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
)}
```

### A.6 Loading Spinner Pattern
```tsx
<div className="flex items-center justify-center py-12">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
</div>
```

### A.7 Empty State Pattern
```tsx
<Card>
  <CardContent>
    <div className="text-center py-12">
      <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {/* icon */}
      </svg>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">No roles yet</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
        Create your first role to get started.
      </p>
      <div className="mt-6">
        <Button variant="gradient" gradient="from-purple-500 to-indigo-500" onClick={handleCreate}>
          + Add Role
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Appendix B: Accessibility Checklist

| Criteria | Implementation |
|----------|---------------|
| **Color contrast** | All text meets WCAG AA 4.5:1 minimum. Purple-600 text on white passes. |
| **Keyboard navigation** | All interactive elements are focusable. Arrow keys in dropdowns. Escape closes modals/dropdowns. Tab follows logical order. |
| **Focus indicators** | `focus:ring-2 focus:ring-purple-500 focus:ring-offset-2` on all interactive elements |
| **ARIA labels** | `role="option"`, `aria-selected` on list items. `aria-label` on icon-only buttons. |
| **Screen reader** | Semantic HTML (`<nav>`, `<main>`, `<section>`, `<h1>`, `<h2>`). Descriptions for complex controls. |
| **Touch targets** | Minimum 44×44px for all interactive elements (buttons, checkboxes — already met by existing patterns). |
| **Reduced motion** | `prefers-reduced-motion` respected via `motion-safe:` Tailwind variants (existing pattern). |
| **Error announcements** | Errors use `role="alert"` or are announced via toast (existing `aria-live` region). |

---

*End of specification. This document should be used as the single source of truth for implementing the Roles & Permissions UI.*
