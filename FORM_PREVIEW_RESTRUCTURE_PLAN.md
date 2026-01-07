# Form + Preview Layout Restructure Plan

## Current State
The invoice creation page uses a WYSIWYG design where the left side looks like an invoice (editable) and the right sidebar has controls (Brand Color, Currency, Tax Type).

## Goal
Restructure to have:
- **Left Side:** Clean form with inputs
- **Right Side:** Live preview of invoice

## Implementation Plan

### Phase 1: Create InvoicePreview Component ✅
Created `/components/invoice/InvoicePreview.tsx` - a read-only component that displays the invoice based on form data.

###Phase 2: Update New Invoice Page ✅  
Updated `/app/invoices/new/page.tsx`:
- Grid layout with 2 columns
- Left column: Form
- Right column: Preview with sticky positioning

### Phase 3: Restructure InvoiceForm Component ⏳
Need to transform `/components/forms/invoice/InvoiceForm.tsx` from invoice-styled to clean form:

**Current Structure (Invoice-styled):**
```
<div style="looks-like-invoice">
  <Logo placeholder />
  <Business selector inline />
  <Invoice # inline />
  <Dates inline />
  <Client selector />
  <Line items table />
  <Totals display />
  <Notes field />
</div>
<Sidebar>
  <Brand Color />
  <Currency />
  <Tax Type />
</Sidebar>
```

**Target Structure (Clean Form):**
```
<div className="form">
  <Section title="Invoice Details">
    <Input: Invoice Number />
    <Select: Status />
    <Input: Issue Date />
    <Input: Due Date />
  </Section>
  
  <Section title="From (Business)">
    <Select: Business />
  </Section>
  
  <Section title="Bill To (Client)">
    <Select: Client />
  </Section>
  
  <Section title="Line Items">
    <Button: Add Item />
    {items.map(item =>
      <Card>
        <Select: Item />
        <Input: Quantity />
        <Input: Price />
        <Button: Remove />
      </Card>
    )}
  </Section>
  
  <Section title="Financials">
    <Select: Currency />
    <Select: Tax Type />
    <Input: Tax Rate />
    <Input: Discount />
    <Input: Shipping />
  </Section>
  
  <Section title="Customization">
    <Input type="color": Brand Color />
  </Section>
  
  <Section title="Notes">
    <Textarea: Customer Notes />
    <Textarea: Terms & Conditions />
  </Section>
</div>
```

## Files That Need Changes

### 1. `/components/forms/invoice/InvoiceForm.tsx` - MAJOR REFACTOR
**Lines to change:**
- Line 148-167: Remove invoice-styled wrapper, use clean form card
- Line 170-240: Replace invoice header layout with form sections
- Line 242-275: Replace inline client selector with form section
- Line 277-455: Replace table-styled line items with card-styled items
- Line 455-530: Move sidebar controls (Currency, Tax) into main form sections
- Add new sections for: Customization, Notes

**Key Changes:**
- Remove all invoice styling (borders, shadows, large headers)
- Convert to sectioned form with clear labels
- Move sidebar controls into main form flow
- Simplify line item display (cards instead of table)
- Add section headers with icons

### 2. `/app/invoices/new/page.tsx` - ALREADY DONE ✅
- Grid layout implemented
- Preview component added
- Responsive design included

## Benefits
1. **Clearer UX:** Separation between editing and previewing
2. **Better Mobile:** Form is easier to fill on mobile devices
3. **Live Feedback:** See changes in real-time on preview
4. **Standard Pattern:** Matches common invoice builder UX

## Next Steps

Since the InvoiceForm refactor is complex (537 lines), here are options:

**Option A: Manual Refactor** (Recommended)
1. Create new file: `InvoiceFormSimplified.tsx`
2. Copy form state logic from original
3. Build new JSX structure section by section
4. Test each section before moving to next
5. Replace import in `/app/invoices/new/page.tsx`

**Option B: Gradual Migration**
1. Keep current WYSIWYG form for now
2. Add preview panel alongside it
3. Refactor form incrementally over time

**Option C: Use Current Design**
The current WYSIWYG design is actually quite good - it shows exactly what the invoice will look like. We could:
1. Keep the current invoice-styled form
2. Just add a smaller preview thumbnail in sidebar
3. Or add a "Preview" toggle button

## Recommendation

Given the complexity, I recommend **Option C** or **Option B**. The current WYSIWYG design is intuitive and functional. Adding a live preview is nice but may not be worth the large refactor unless you strongly prefer the form/preview split.

If you want to proceed with the full refactor (Option A), I can help create the new InvoiceFormSimplified component step by step.

