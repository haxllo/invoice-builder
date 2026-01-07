# Invoice Preview Enhancement

## Current State

The invoice creation page currently uses a **WYSIWYG (What You See Is What You Get)** design:

- **Left Side:** Editable invoice form that looks exactly like an invoice
  - Business logo placeholder
  - Invoice number field
  - Date fields
  - Client selection
  - Line items table
  - Totals section
  - Notes section
  
- **Right Side:** Customization controls
  - Brand Color picker
  - Currency selector
  - Tax Type selector

## User Request

Add a **live preview panel** on the right side that shows:
- Read-only preview of the invoice as it's being filled
- Updates in real-time as user fills in fields
- Shows exactly how the final invoice will look

## Options for Implementation

### Option 1: Replace Controls with Preview (Recommended)
**Changes:**
- Move controls (Brand Color, Currency, Tax Type) to top of left form or in a collapsible panel
- Replace right sidebar entirely with invoice preview
- Preview updates live as form changes

**Pros:**
- Clear separation between editing and previewing
- More space for preview
- Better for print/PDF visualization

**Cons:**
- Need to relocate customization controls
- More complex state management

### Option 2: Split Right Sidebar
**Changes:**
- Top half: Preview (smaller)
- Bottom half: Controls

**Pros:**
- Keeps controls visible
- Quick preview access

**Cons:**
- Preview will be quite small
- May be cramped on smaller screens

### Option 3: Toggle Mode
**Changes:**
- Add "Preview" / "Edit" toggle button
- Switch between form view and preview view

**Pros:**
- Full screen for each mode
- Simpler implementation

**Cons:**
- Can't see both at same time
- Extra click to switch

## Technical Implementation

Would use existing `InvoicePDF` component or create new `InvoicePreview` component:

```tsx
<InvoicePreview 
  invoice={formData.invoice}
  businesses={businesses}
  clients={clients}
/>
```

## Recommendation

**Option 1** provides the best user experience for invoice creation:
- Left: Form inputs (simplified, clean)
- Right: Live preview (realistic invoice appearance)
- Controls moved to top toolbar or left form sections

This matches common invoice builder UX patterns (similar to design tools like Canva, invoice SaaS apps).

## Next Steps

If you'd like to implement this:
1. Create `InvoicePreview` component (read-only version of form)
2. Restructure layout in `app/invoices/new/page.tsx`
3. Move customization controls to appropriate location
4. Add responsive behavior for mobile

