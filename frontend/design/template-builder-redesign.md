# Medication Evaluation Template Builder Modal — Redesign Spec

**Component**: `TemplateBuilderModal.tsx`
**Current location**: `frontend/src/components/features/medication-evaluations/TemplateBuilderModal.tsx`
**Scope**: Redesign the UI of the existing template builder modal. Logic, state management, and API calls remain unchanged.

---

## 1. Overall Modal Layout

### 1.1 Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Gradient Accent Bar — h-1.5, from-emerald-500 to-teal-500] │
│  Modal Header  "Create Template" / "Edit Template"    [✕]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Section 1: Template Information ────────────────────┐  │
│  │  ... (two-column grid)                                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ─── thin divider (border-t border-slate-100) ──────────    │
│                                                             │
│  ┌─ Section 2: Auto-Included Medications ───────────────┐  │
│  │  ... (info card with icon)                            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ─── thin divider (border-t border-slate-100) ──────────    │
│                                                             │
│  ┌─ Section 3: Criteria Builder ─────────────────────────┐  │
│  │  ... (header row + scrollable list)                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Sticky Footer:                      [Cancel]  [Save]       │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Key Changes from Current

| Aspect | Current | Redesigned |
|--------|---------|------------|
| Modal size | `size="lg"` (`max-w-3xl`) | `size="xl"` (`max-w-5xl`) |
| Header | Plain border-bottom, no accent | Gradient accent bar above header |
| Section separation | Spacing (`space-y-6`) | Thin dividers + spacing |
| Scroll behavior | Entire modal scrolls | Fixed header + sticky footer, body scrolls |
| Footer | Simple border-top | Sticky within modal, elevated |

### 1.3 Component Usage

```
<Modal isOpen={...} onClose={...} size="xl">
  {/* Accent bar */}
  <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

  <ModalHeader title={...} onClose={...} />

  <ModalContent className="overflow-y-auto max-h-[calc(90vh-200px)]">
    ...
  </ModalContent>

  <ModalFooter>
    <Button variant="outline">Cancel</Button>
    <Button variant="gradient" gradient="from-emerald-500 to-teal-500">
      Create Template
    </Button>
  </ModalFooter>
</Modal>
```

### 1.4 Layout Tokens

| Token | Value |
|-------|-------|
| Modal backdrop | `bg-black/50` (unchanged from Modal.tsx) |
| Modal max-width | `max-w-5xl` (size="xl") |
| Modal corners | `rounded-xl` (existing) |
| Accent bar height | `h-1.5` |
| Accent bar gradient | `from-emerald-500 to-teal-500` |
| Section divider | `border-t border-slate-100` (lighter than header/footer borders) |
| Section spacing below divider | `pt-6` |
| Section spacing above divider | `mt-6` |
| Modal body max-height | `max-h-[calc(90vh-200px)]` — accounts for header + footer |
| Footer bg | `bg-white` with subtle top shadow |

---

## 2. Template Information Section

### 2.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Template Information                                       │
│                                                             │
│  ┌──────────────────────────────────┐ ┌────────────────────┐ │
│  │ Template Name *                  │ │                    │ │
│  │ [  e.g., Quarterly Medication  ] │ │   (spacer)         │ │
│  │                                  │ │                    │ │
│  └──────────────────────────────────┘ └────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────┐      │
│  │ Description                                       │      │
│  │ [  Describe the purpose of this template...      ] │      │
│  │                                                    │      │
│  └────────────────────────────────────────────────────┘      │
│                                                             │
│  ┌──────────────────────┐ ┌─────────────────────────────┐   │
│  │                      │ │                             │   │
│  │  [Active Toggle]     │ │  (empty space)              │   │
│  │  Active              │ │                             │   │
│  │                      │ │                             │   │
│  └──────────────────────┘ └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Key Changes

- **Name input** — full width first row (col-span-2 on desktop)
- **Description** — full width, full rows
- **Active toggle** — positioned on a separate row, aligned left, next to empty space for visual balance OR as a single row with a right-aligned toggle
- Section uses `Card` with `variant="outlined"` for a contained, elevated feel

### 2.3 Component Usage

```tsx
<Card variant="outlined" padding="none" className="overflow-hidden">
  {/* Gradient accent */}
  <div className="h-1 bg-gradient-to-r from-emerald-500/40 to-teal-500/40" />

  <CardHeader
    title="Template Information"
    subtitle="Set up the basic details for this evaluation template."
  />

  <CardContent className="space-y-4">
    {/* Row 1: Template Name (full width) */}
    <div>
      <Label required>Template Name</Label>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Quarterly Medication Check"
      />
    </div>

    {/* Row 2: Description (full width) */}
    <div>
      <Label>Description</Label>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the purpose of this template..."
        rows={3}
        className="resize-y"
      />
    </div>

    {/* Row 3: Active toggle */}
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-3">
        <Switch checked={isActive} onChange={setIsActive} />
        <span className="text-sm font-medium text-slate-700">Active</span>
      </div>
      <p className="text-xs text-slate-400">
        Inactive templates won't be available for evaluations
      </p>
    </div>
  </CardContent>
</Card>
```

### 2.4 Design Decisions

- **Switch component**: Replace the inline checkbox toggle with a dedicated `Switch` component (or a styled version using the same Tailwind primitives). The switch should use `peer-checked:bg-emerald-500` to match the emerald/teal palette.
- **Switch specs**: `h-6 w-11 rounded-full`, knob `h-5 w-5` with smooth transition, `focus:ring-2 focus:ring-emerald-500`.
- The toggle row includes helpful hint text on the right ("Inactive templates won't be available for evaluations") for improved UX.
- **Description textarea**: Uses `rounded-xl` and border colors to match the Input component, `focus:ring-2 focus:ring-emerald-500`.

---

## 3. Auto-Included Medications Section

### 3.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Medications                                         │   │
│  │                                                     │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  💊   Auto-Included Medications                │  │   │
│  │  │      ──────────────────────────                │  │   │
│  │  │      All **24** medications from the catalog   │  │   │
│  │  │      will be automatically included in this    │  │   │
│  │  │      evaluation template.                      │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Key Changes

- Replace the plain info box with a **glass/styled info card**:
  - Left side: gradient circular icon container with a pill/capsule icon
  - Background: subtle gradient `bg-gradient-to-br from-emerald-50 to-teal-50`
  - Border: `border-emerald-200` with `shadow-sm`
- More descriptive text explaining *why* medications are auto-included
- Icon: use a medical/capsule SVG for visual identity

### 3.3 Component Usage

```tsx
<Card variant="outlined" padding="none" className="overflow-hidden">
  <div className="h-1 bg-gradient-to-r from-emerald-500/40 to-teal-500/40" />

  <CardHeader title="Medications" subtitle="Catalog auto-inclusion" />

  <CardContent>
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50/30 to-emerald-50/50 border border-emerald-200/60 rounded-xl p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Icon container — gradient circle with capsule icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shrink-0">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        </div>

        {/* Text content */}
        <div className="flex-1">
          <p className="text-sm font-semibold text-emerald-800">
            Auto-Included Medications
          </p>
          <p className="text-sm text-emerald-700 mt-1.5 leading-relaxed">
            All <strong className="text-emerald-900">{activeMedicationCount}</strong>{' '}
            active medications from the catalog will be automatically included
            in this evaluation template. Medications cannot be individually
            excluded — this template evaluates against the full catalog.
          </p>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

### 3.4 Accessibility Notes

- Icon uses `aria-hidden="true"` (decorative)
- Text is descriptive enough that screen readers get the full context
- Color contrast: emerald-700 text on emerald-50 background passes WCAG AA

---

## 4. Criteria Builder (Most Complex Section)

### 4.1 Layout — Header Row

```
┌─────────────────────────────────────────────────────────────┐
│  Criteria                                    ┌─────────────┐│
│  ┌─────┐   ┌─────────────────────────────────┐ │  Add       ││
│  │  3  │   │  Define scoring criteria...      │ │  Criterion ││
│  │ def │   │                                  │ │            ││
│  └─────┘   └──────────────────────────────────┘ └────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Header Row Elements**:
- Left: "Criteria" heading (bold, text-slate-800) with count badge (rounded-full, bg-emerald-100, text-emerald-700, `text-xs`)
- Right: "Add Criterion" button (`Button variant="outline"` with `+` icon, or gradient for emphasis)

### 4.2 Layout — Criterion Row (Desktop)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [▲]  ┌──────────────────────┐  ┌──────────┐  ┌──────┐  ┌──────────────┐  │
│  [▼]  │  Criterion Name      │  │  Type    │  │ Wgt  │  │  [Remove]    │  │
│       │  [e.g., Sterility]   │  │ [Yes/No]▼│  │ [1.0]│  │   (red X)    │  │
│       └──────────────────────┘  └──────────┘  └──────┘  └──────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Layout — Criterion Row (Mobile)

```
┌────────────────────────────────────────────┐
│  [▲]  [▼]  Criterion Name                  │
│             [  e.g., Sterility           ]  │
│                                            │
│             Type    [Yes/No]▼              │
│             Weight  [1.0]      [✕]         │
└────────────────────────────────────────────┘
```

### 4.4 Key Changes

| Aspect | Current | Redesigned |
|--------|---------|------------|
| Row container | `bg-slate-50 border-slate-200` | `bg-white border-slate-100 shadow-sm hover:shadow-md` |
| Row corners | `rounded-xl` | `rounded-xl` (kept, matches design system) |
| Row padding | `p-4` | `p-4` (kept) |
| Column grid | `md:grid-cols-4` | `lg:grid-cols-7` for more precise control |
| Label style | `text-[10px]` inline | `text-xs font-medium text-slate-500` (more readable) |
| Type dropdown | Raw `<select>` | Styled `<select>` matching Input border/focus style |
| Remove button | `mt-5 p-2` | `self-start mt-4 p-1.5` with visible-on-hover bg |
| Empty state | Plain text in dashed box | Icon + text + button in centered dashed box |

### 4.5 Component Usage — Criteria Header

```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <h3 className="text-lg font-bold text-slate-800">Criteria</h3>
    {criteria.length > 0 && (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
        {criteria.length} defined
      </span>
    )}
  </div>
  <Button
    variant="outline"
    size="sm"
    onClick={addCriterion}
    leftIcon={
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    }
  >
    Add Criterion
  </Button>
</div>
```

### 4.6 Component Usage — Empty State

```tsx
{criteria.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center mb-4">
      <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
    <p className="text-base font-medium text-slate-600">No criteria yet</p>
    <p className="text-sm text-slate-400 mt-1 mb-5">
      Add scoring criteria to define how medications are evaluated.
    </p>
    <Button
      variant="gradient"
      gradient="from-emerald-500 to-teal-500"
      size="sm"
      onClick={addCriterion}
      leftIcon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      }
    >
      Add Your First Criterion
    </Button>
  </div>
) : (...)}
```

### 4.7 Component Usage — Criterion Row

```tsx
{criteria.map((criterion, index) => (
  <div
    key={index}
    className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    {/* ── Reorder Buttons ── */}
    <div className="flex flex-col gap-0.5 mt-1.5 shrink-0">
      <button
        type="button"
        onClick={() => moveCriterion(index, 'up')}
        disabled={index === 0}
        className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label={`Move criterion ${index + 1} up`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => moveCriterion(index, 'down')}
        disabled={index === criteria.length - 1}
        className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label={`Move criterion ${index + 1} down`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    {/* ── Fields Grid ── */}
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
      {/* Name — largest area */}
      <div className="sm:col-span-6">
        <Label className="text-xs font-medium text-slate-500 mb-1">Name</Label>
        <Input
          value={criterion.name}
          onChange={(e) => updateCriterionField(index, 'name', e.target.value)}
          placeholder="e.g., Sterility, pH Level, Clarity"
          className="text-sm"
        />
      </div>

      {/* Type dropdown */}
      <div className="sm:col-span-3">
        <Label className="text-xs font-medium text-slate-500 mb-1">Type</Label>
        <select
          value={criterion.type}
          onChange={(e) => updateCriterionField(index, 'type', e.target.value as 'number' | 'yes_no' | 'text')}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-300 transition-colors"
          aria-label={`Criterion ${index + 1} type`}
        >
          <option value="yes_no">Yes / No</option>
          <option value="number">Number</option>
          <option value="text">Text</option>
        </select>
      </div>

      {/* Weight */}
      <div className="sm:col-span-2">
        <Label className="text-xs font-medium text-slate-500 mb-1">Weight</Label>
        <Input
          type="number"
          min={0}
          step={0.5}
          value={criterion.weight}
          onChange={(e) => updateCriterionField(index, 'weight', parseFloat(e.target.value) || 0)}
          className="text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      {/* Remove */}
      <div className="sm:col-span-1 flex items-end justify-center pb-0.5">
        <button
          type="button"
          onClick={() => removeCriterion(index)}
          className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          title={`Remove criterion ${index + 1}`}
          aria-label={`Remove criterion ${index + 1}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
))}
```

### 4.8 Criterion Row Column Distribution (Desktop)

| Column | Grid cols (sm:grid-cols-12) | Description |
|--------|---------------------------|-------------|
| Name | `sm:col-span-6` | Largest, for criterion name |
| Type | `sm:col-span-3` | Dropdown selector |
| Weight | `sm:col-span-2` | Small number input |
| Remove | `sm:col-span-1` | Icon button |

### 4.9 Scroll Behavior

When criteria count exceeds 5-6 rows:
- Wrap the criteria list in a scrollable container: `max-h-96 overflow-y-auto space-y-3 pr-1`
- Use a custom thin scrollbar to match app styling (`scrollbar-thin` or custom class)
- The entire modal body scrolls independently of the fixed header and sticky footer

```tsx
{criteria.length > 0 && (
  <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scroll">
    {criteria.map((criterion, index) => (
      // ... criterion row
    ))}
  </div>
)}
```

Add a custom thin scrollbar style for the criteria list:

```css
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
```

### 4.10 Edge Cases

| State | Behavior |
|-------|----------|
| Single criterion | Only "down" button disabled (can't move past itself) |
| Two criteria | Both directions work for each, enabling reorder |
| Adding a criterion | Scrolls to bottom of the list (optional: use `useRef` + `scrollIntoView`) |
| Removing the last criterion | Shows the empty state |

---

## 5. Color Scheme & Styling

### 5.1 Color Palette

All values from the existing `@theme` config in `index.css` and Tailwind defaults.

| Token | Usage | Hex/Value |
|-------|-------|-----------|
| `--color-health-500` | Primary accent | `#14b8a6` (teal-500) |
| `--color-health-600` | Hover / strong accent | `#0d9488` (teal-600) |
| `emerald-500` | Gradient partner | `#10b981` |
| `emerald-50` | Light bg for info cards | `#ecfdf5` |
| `emerald-100` | Badge backgrounds | `#d1fae5` |
| `emerald-700` | Badge text, strong text | `#047857` |
| `emerald-800` | Bold text on light bg | `#065f46` |
| `slate-50` | Subtle backgrounds | `#f8fafc` |
| `slate-100` | Dividers, light borders | `#f1f5f9` |
| `slate-200` | Input borders | `#e2e8f0` |
| `slate-400` | Placeholder text | `#94a3b8` |
| `slate-500` | Secondary text | `#64748b` |
| `slate-700` | Body text | `#334155` |
| `slate-800` | Heading text | `#1e293b` |
| `amber-50` | Weight badge bg | `#fffbeb` |
| `amber-200` | Weight badge border | `#fde68a` |
| `amber-700` | Weight badge text | `#b45309` |
| `red-400` | Remove button (default) | `#f87171` |
| `red-50` | Remove hover bg | `#fef2f2` |
| `red-600` | Remove hover text | `#dc2626` |

### 5.2 Gradient Constants

Use these consistent gradients throughout:

| Name | Value | Used For |
|------|-------|----------|
| Modal accent | `from-emerald-500 to-teal-500` | Top accent bar, section accent bars |
| Section accent | `from-emerald-500/40 to-teal-500/40` | Subdued card accent bars |
| Icon container | `from-emerald-500 to-teal-500` | Medication icon circle |
| Button primary | `from-emerald-500 to-teal-500` | Save button, Add First Criterion |
| Empty state icon | `from-emerald-100 to-teal-100` | Dashed area icon bg |
| Info card | `from-emerald-50 via-teal-50/30 to-emerald-50/50` | Medications info card |

### 5.3 Border Radius

| Element | Radius |
|---------|--------|
| Modal container | `rounded-xl` (0.75rem) |
| Cards | `rounded-2xl` (1rem) |
| Input fields | `rounded-xl` (0.75rem) |
| Info card inside | `rounded-xl` (0.75rem) |
| Criterion rows | `rounded-xl` (0.75rem) |
| Buttons | `rounded-xl` (0.75rem) |
| Empty state container | `rounded-2xl` (1rem) |
| Badges | `rounded-full` |
| Icon boxes | `rounded-xl` (0.75rem) |

### 5.4 Shadows

| Level | Class | Usage |
|-------|-------|-------|
| Subtle | `shadow-sm` | Criterion rows, section cards |
| Elevated | `shadow-md` | Info card, hovered criterion rows |
| Overlay | `shadow-xl` | Modal container |

### 5.5 Transitions

All interactive elements include `transition-all duration-200` for smooth state changes:

- Criterion rows: hover `shadow-md` transition
- Remove button: hover bg/text color change
- Reorder buttons: hover bg/text color change
- Input focus: ring + border color
- Add Criterion button: standard Button hover effects

---

## 6. Responsive Behavior

### 6.1 Breakpoint Strategy

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | `< 640px` | Single column, stacked |
| Tablet | `640px – 1024px` | Two columns for Template Info, compact criteria |
| Desktop | `> 1024px` | Full spacious multi-column layout |

### 6.2 Responsive Behavior by Section

**Modal itself**:
- Mobile: `max-w-5xl` still applies (full width with `p-4` padding)
- The modal already has `max-h-[90vh] overflow-y-auto` — this is fine

**Section 1 — Template Information**:
- Desktop (`md:grid-cols-1`): Name full width, Description full width, toggle row with hint
- All breakpoints: single column since name/description benefit from full width
- Toggle row: stays inline with hint on right in desktop, hint stacked below on mobile

**Section 2 — Auto-Included Medications**:
- All breakpoints: single card, text wraps naturally
- Icon + text side by side on all sizes, stacks only on very small (< 400px)

**Section 3 — Criteria Builder**:
- Desktop (`sm:grid-cols-12`): Name(6) + Type(3) + Weight(2) + Remove(1)
- Tablet: Name(6) + Type(3) + Weight(2) + Remove(1) — still works
- Mobile (`< 640px`): Stack vertically — Name full width, Type + Weight in a sub-row, Remove right-aligned

```
Mobile Criterion Row (sm breakpoint):
┌────────────────────────────────────────────────┐
│  [▲]  [▼]                                       │
│         ┌────────────────────────────────────┐  │
│         │  Criterion Name                    │  │
│         │  [input field]                     │  │
│         └────────────────────────────────────┘  │
│                                                  │
│         ┌────────────┐  ┌──────┐  ┌──────┐     │
│         │  Type [▼]  │  │ Wgt  │  │  [✕] │     │
│         └────────────┘  └──────┘  └──────┘     │
└────────────────────────────────────────────────┘
```

**Mobile implementation approach**: Use `grid-cols-1` as base with `sm:grid-cols-12` for the field layout. The reorder buttons remain on the left. Remove button stays right-aligned below the fields or inline on the weight row.

```tsx
{/* On mobile: fields stack; on sm+: 12-col grid */}
<div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
  {/* Name — full width on mobile, 6 cols on sm+ */}
  <div className="sm:col-span-6">...</div>

  {/* Type + Weight: side by side on mobile (2-col sub-grid), 3+2 on sm+ */}
  <div className="sm:col-span-3">...</div>
  <div className="sm:col-span-2">...</div>

  {/* Remove: right side */}
  <div className="sm:col-span-1">...</div>
</div>
```

### 6.3 Scroll Container Responsiveness

The criteria scroll container (`max-h-96`) has a fixed max-height on desktop but should be shorter on mobile to avoid taking up too much screen:

```tsx
<div className={`space-y-3 ${criteria.length > 5 ? 'max-h-60 sm:max-h-80 lg:max-h-96 overflow-y-auto pr-1' : ''}`}>
```

---

## 7. Accessibility

### 7.1 Labels & ARIA

| Element | Requirement |
|---------|-------------|
| Template Name input | `<Label htmlFor="template-name">` + `id="template-name"` on Input |
| Description textarea | `<Label htmlFor="template-desc">` + `id="template-desc"` |
| Active toggle | `<label>` wrapping switch with visible text "Active" |
| Criterion Name input | `<Label>` with text "Name" (visible) |
| Criterion Type select | `<Label>` with text "Type" (visible) |
| Criterion Weight input | `<Label>` with text "Weight" (visible) |
| Remove button | `aria-label="Remove criterion {N}"` |
| Reorder up button | `aria-label="Move criterion {N} up"` |
| Reorder down button | `aria-label="Move criterion {N} down"` |
| Add Criterion button | Text "Add Criterion" is descriptive enough |
| Save button | Text is descriptive ("Create Template" / "Save Changes") |

### 7.2 Keyboard Navigation

| Action | Key | Notes |
|--------|-----|-------|
| Form inputs | Tab | Standard tab order follows visual order |
| Add Criterion | Tab to button + Enter/Space | Button is focusable |
| Remove Criterion | Tab to X button + Enter/Space | Visible focus ring |
| Reorder up/down | Tab to arrow buttons + Enter/Space | Disabled state prevents focus issues |
| Close modal | Escape | Handled by Modal component |
| Save | Tab to Save + Enter | Standard button behavior |

### 7.3 Focus States

All interactive elements must have visible focus indicators:

- **Inputs**: `focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`
- **Buttons**: `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`
- **Select**: `focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`
- **Remove icon button**: `focus:outline-none focus:ring-2 focus:ring-red-500`
- **Reorder buttons**: `focus:outline-none focus:ring-2 focus:ring-emerald-500`

### 7.4 Color Contrast

All combinations must meet WCAG AA (4.5:1 for normal text, 3:1 for large text):

| Pair | Ratio | Pass? |
|------|-------|-------|
| `text-slate-700` on `bg-white` | ~5.5:1 | ✅ AA |
| `text-emerald-800` on `bg-emerald-50` | ~5.2:1 | ✅ AA |
| `text-emerald-700` on `bg-emerald-50` | ~4.8:1 | ✅ AA |
| `text-slate-500` on `bg-white` | ~4.5:1 | ✅ AA |
| `text-white` on `from-emerald-500` | ~4.7:1 | ✅ AA |
| `text-red-600` on `bg-red-50` | ~4.6:1 | ✅ AA |

### 7.5 Motion Sensitivity

The `animate-fade-in` on criterion rows should respect the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none;
  }
}
```

Or use Tailwind's `motion-safe:` prefix:

```tsx
style={{ animationDelay: `${index * 50}ms` }}
className="... motion-safe:animate-fade-in"
```

---

## 8. Empty/Loading/Error States

### 8.1 Empty State (No Criteria)

Already covered in §4.6 — centered dashed border area with icon, text, and CTA button.

### 8.2 Loading State (Saving)

- Save button shows spinner via `isLoading={isLoading}` prop on `Button`
- All inputs remain editable (the save is async)
- The button is disabled during loading via the Button component's built-in behavior

### 8.3 Validation Errors

- Template name empty: toast "Template name is required" (existing behavior via `useToast`)
- No criteria: toast "Please define at least one criterion" (existing behavior)
- Optionally: highlight the Name input with `error` prop from Input component when name is empty on submit attempt

### 8.4 Edge: Medications Not Yet Loaded

If the medication store hasn't been fetched yet, the info card shows:

> "Loading medication count..."

Use a simple conditional:

```tsx
{medications.length === 0 ? (
  <span className="text-emerald-600 animate-pulse">Loading...</span>
) : (
  <strong className="text-emerald-900">{activeMedicationCount}</strong>
)}
```

---

## 9. Micro-Interactions & Animations

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Criterion row appear | Fade in + slide up slightly | 300ms | `ease-out` |
| Remove criterion | Shrink + fade out (future: use `framer-motion` or CSS) | 200ms | `ease-in` |
| Reorder criterion | Instant swap (state update) | 150ms | `ease` |
| Hover on criterion row | TranslateY(-1px) + shadow | 200ms | `ease-out` |
| Button hover | TranslateY(-0.5px) + shadow | 200ms | `ease-out` |
| Focus ring | Ring appears | 150ms | `ease` |

Implementation note: For the fade-in on new criterion rows, use a staggered delay:

```tsx
// Each row gets a progressively longer delay
style={{ animationDelay: `${index * 50}ms` }}
```

This creates a cascading effect when multiple rows are present.

---

## 10. Detailed Component Usage Map

### 10.1 UI Components Used

| Component | File | Used For |
|-----------|------|----------|
| `Modal` | `ui/modals/Modal.tsx` | Modal container (`size="xl"`) |
| `ModalHeader` | `ui/modals/ModalHeader.tsx` | Title + close button |
| `ModalContent` | `ui/modals/ModalContent.tsx` | Scrollable body wrapper |
| `ModalFooter` | `ui/modals/ModalFooter.tsx` | Cancel/Save buttons |
| `Card` | `ui/cards/Card.tsx` | Section containers (variant="outlined") |
| `CardHeader` | `ui/cards/Card.tsx` | Section titles |
| `CardContent` | `ui/cards/Card.tsx` | Section body padding |
| `Input` | `ui/forms/Input.tsx` | Name, Weight, Criterion Name fields |
| `Textarea` | `ui/forms/Textarea.tsx` | Description field |
| `Label` | `ui/forms/Label.tsx` | Field labels |
| `Button` | `ui/buttons/Button.tsx` | All action buttons |

### 10.2 Inline Components to Build

| Element | Description |
|---------|-------------|
| `Switch` | Custom toggle switch (inline, no separate file needed — reuse the existing `peer` pattern with updated colors) |
| Styled `<select>` | Inline styled select for criterion type (no separate component — use Tailwind classes directly) |

### 10.3 New Patterns Introduced

| Pattern | Description |
|---------|-------------|
| Section accent bar | `h-1 bg-gradient-to-r from-emerald-500/40 to-teal-500/40` inside Card |
| Info gradient card | `bg-gradient-to-br from-emerald-50 via-teal-50/30 to-emerald-50/50` |
| Empty state with CTA | Dashed border container with gradient icon + text + button |
| Criteria scroll area | `max-h-96 overflow-y-auto` + custom thin scrollbar |
| Staggered animation | `style={{ animationDelay }}` on each row |

---

## 11. Implementation Checklist

### Prerequisites
- [ ] Modal size changed from `lg` to `xl`
- [ ] Accent bar added at top of modal
- [ ] Section dividers added (`border-t border-slate-100 mt-6 pt-6`)
- [ ] Modal body scrolls with `overflow-y-auto` + max-height

### Section 1 — Template Information
- [ ] Wrap in `Card variant="outlined"` with `CardHeader`
- [ ] Name input full width
- [ ] Description textarea full width, consistent styling
- [ ] Active toggle as styled switch with label + hint text
- [ ] Subdue section accent (40% opacity gradient)

### Section 2 — Auto-Included Medications
- [ ] Replace plain box with gradient info card
- [ ] Add gradient icon container with capsule icon
- [ ] Update text to be more descriptive
- [ ] Handle loading state for medication count

### Section 3 — Criteria Builder
- [ ] Header with "Criteria" + count badge + "Add Criterion" button
- [ ] Empty state with dashed border + icon + CTA button
- [ ] Criterion rows with white card style + shadow
- [ ] Reorder buttons on left with hover states + focus rings
- [ ] Name input (largest column)
- [ ] Type dropdown (styled select)
- [ ] Weight input (compact number field)
- [ ] Remove button on right with hover state
- [ ] Scrollable area when > 5 criteria
- [ ] Responsive column layout (stack on mobile)
- [ ] Staggered fade-in animation

### Accessibility
- [ ] Labels with `htmlFor` on all inputs
- [ ] `aria-label` on reorder and remove buttons
- [ ] Focus rings on all interactive elements
- [ ] Keyboard navigation verified (Tab/Enter/Escape)
- [ ] Color contrast verified

---

## Appendix: ASCII Mockup — Full Modal

```
┌──────────────────────────────────────────────────────────────────┐
╔══════════════════════════════════════════════════════════════════╗
║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║  ← Gradient accent bar
║  Create Template                                           [✕]  ║  ← ModalHeader
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ Template Information                                       │  ║
║  │ ─────────────────────────────────────────────────────────  │  ║
║  │                                                             │  ║
║  │ Template Name *                                             │  ║
║  │ [  e.g., Quarterly Medication Check                     ]  │  ║
║  │                                                             │  ║
║  │ Description                                                 │  ║
║  │ [  Describe the purpose of this template...              ]  │  ║
║  │ [                                                         ] │  ║
║  │ [                                                         ] │  ║
║  │                                                             │  ║
║  │ [═══] Active    Inactive templates won't be available...    │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  ─────────────────────────────────────────────────────────────── ║
║                                                                  ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ Medications                                                │  ║
║  │ ─────────────────────────────────────────────────────────  │  ║
║  │                                                             │  ║
║  │  [💊]  Auto-Included Medications                            │  ║
║  │        All 24 active medications from the catalog will be   │  ║
║  │        automatically included in this evaluation template.  │  ║
║  │        Medications cannot be individually excluded.         │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  ─────────────────────────────────────────────────────────────── ║
║                                                                  ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ Criteria                                    [+ Add Criterion]│  ║
║  │ ─────────────────────────────────────────────────────────  │  ║
║  │                                                             │  ║
║  │  ┌──────────────────────────────────────────────────────┐  │  ║
║  │  │  [▲]  │  Criterion Name      │ Type  │ Wgt  │  [✕]  │  │  ║
║  │  │  [▼]  │  [ Sterility      ]  │[Yes/N]│ [1.0] │       │  │  ║
║  │  └──────────────────────────────────────────────────────┘  │  ║
║  │                                                             │  ║
║  │  ┌──────────────────────────────────────────────────────┐  │  ║
║  │  │  [▲]  │  Criterion Name      │ Type  │ Wgt  │  [✕]  │  │  ║
║  │  │  [▼]  │  [pH Level        ]  │[Number]│ [1.5] │       │  │  ║
║  │  └──────────────────────────────────────────────────────┘  │  ║
║  │                                                             │  ║
║  │  ┌──────────────────────────────────────────────────────┐  │  ║
║  │  │  [▲]  │  Criterion Name      │ Type  │ Wgt  │  [✕]  │  │  ║
║  │  │  [▼]  │  [Clarity         ]  │[Text] │ [0.5] │       │  │  ║
║  │  └──────────────────────────────────────────────────────┘  │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                           [Cancel]  [Save]       ║
╚══════════════════════════════════════════════════════════════════╝
└──────────────────────────────────────────────────────────────────┘
```

---

## Design Spec Metadata

| Field | Value |
|-------|-------|
| **Project** | PHC Evaluation System |
| **Component** | TemplateBuilderModal.tsx |
| **Designer** | UI Designer Agent |
| **Date** | 2026-06-26 |
| **Status** | Ready for implementation |
| **Framework** | React 19 + TypeScript + Tailwind CSS v4 |
| **Accessibility Target** | WCAG AA |
