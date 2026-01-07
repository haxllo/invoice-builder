# Invoice Creation Fix - Missing NOT NULL Fields

## Issues
When creating an invoice, it failed with multiple NOT NULL constraint errors:
1. `null value in "currency_subunit_snapshot" violates not-null constraint` ✅ Fixed
2. `null value in "discount_percent" violates not-null constraint` ✅ Fixed

## Root Cause
The invoice form was not initializing all required NOT NULL fields from the database schema. Many fields have DEFAULT values in the database, but the application must still provide them when inserting via the API.

## Required NOT NULL Fields (from schema)

### ✅ Snapshot Fields
- `business_name_snapshot` ✅
- `business_short_name_snapshot` ✅ (max 2 chars)
- `client_name_snapshot` ✅
- `currency_code_snapshot` ✅
- `currency_symbol_snapshot` ✅
- `currency_subunit_snapshot` ✅

### ✅ Financial Fields
- `discount_amount_cents` ✅ (DEFAULT 0)
- `discount_percent` ✅ (DEFAULT 0) - **was missing**
- `shipping_fee_cents` ✅ (DEFAULT 0)
- `tax_rate` ✅ (DEFAULT 0)

### ✅ Customization Fields
- `customization_color` ✅ (DEFAULT '#006400')
- `customization_logo_size` ✅ (DEFAULT 'medium') - **was missing**
- `customization_font_size_size` ✅ (DEFAULT 'medium') - **was missing**
- `customization_layout` ✅ (DEFAULT 'classic') - **was missing**
- `customization_table_header_style` ✅ (DEFAULT 'light') - **was missing**
- `customization_table_row_style` ✅ (DEFAULT 'classic') - **was missing**
- `customization_page_format` ✅ (DEFAULT 'A4') - **was missing**
- `customization_label_upper_case` ✅ (DEFAULT 0) - **was missing**

### ✅ Line Item Fields
- `item_name_snapshot` ✅
- `unit_price_cents_snapshot` ✅
- `unit_name_snapshot` ✅ (optional in schema but should be populated)

## Changes Made

### 1. **InvoiceForm.tsx** - Added currency snapshot fields
- Added `currencySubunitSnapshot: 100` to initial form state
- Updated currency selection handler to populate all 3 currency snapshot fields:
  - `currencyCodeSnapshot` (e.g., "USD")
  - `currencySymbolSnapshot` (e.g., "$")
  - `currencySubunitSnapshot` (e.g., 100)

### 2. **InvoiceForm.tsx** - Added business short name snapshot
- Updated business selection handler to include `businessShortNameSnapshot`
- Maps from `business.shortName` field

### 3. **useItemsRetrieve.ts** - Added unit name to items query
- Modified SELECT query to join with `units` table
- Now fetches `unitName:units(name)` for each item
- Item type already supported this field

### 4. **InvoiceForm.tsx** - Added unit name snapshot to line items
- Updated item selection handler to populate `unitNameSnapshot`
- Maps from `item.unitName` field (now available from updated hook)

### 5. **InvoiceForm.tsx** - Added missing financial field
- Added `discountPercent: 0` to initial form state

### 6. **InvoiceForm.tsx** - Added all missing customization fields
- `customizationLogoSize: 'medium'`
- `customizationFontSizeSize: 'medium'`
- `customizationLayout: 'classic'`
- `customizationTableHeaderStyle: 'light'`
- `customizationTableRowStyle: 'classic'`
- `customizationPageFormat: 'A4'`
- `customizationLabelUpperCase: false`

### 7. **app/invoices/new/page.tsx** - Added toast notifications
- Added toast.success() on successful invoice creation
- Added toast.error() with specific error message on failure
- Added toast.error() when required fields are missing
- Added console.log() for debugging

## Testing
1. Refresh browser at `localhost:3000/invoices/new`
2. Log in as test user
3. Fill in required fields:
   - Invoice # (e.g., "INV-001")
   - Select Business (will populate name + short name + address + email snapshots)
   - Select Client (will populate name snapshot)
   - Select Currency (will populate code + symbol + subunit snapshots)
   - Add line item and select an item (will populate item name + unit price + unit name snapshots)
4. Click "Create Invoice"
5. Should see success toast and redirect to /invoices

## Build Status
✅ TypeScript compilation: No errors
✅ Next.js build: Successful
✅ All snapshot fields: Now properly populated

## Data Status
✅ 6 businesses with short_name field
✅ 9 clients 
✅ 8 items with unit relationships
✅ 10 currencies with subunit field
✅ Test user: test@invoice-builder.com / TestPassword123!

## Summary of All Fixes

### Issue 1: Missing `currency_subunit_snapshot`
**Error:** `null value in "currency_subunit_snapshot" violates not-null constraint`
**Fix:** Added to form initialization and currency selection handler

### Issue 2: Missing `discount_percent`  
**Error:** `null value in "discount_percent" violates not-null constraint`
**Fix:** Added `discountPercent: 0` to form initialization

### Issue 3: Missing customization fields
**Potential errors:** 7 customization fields with NOT NULL constraints
**Fix:** Added all 7 fields with appropriate defaults matching database schema

## Testing
1. **Refresh browser** at `localhost:3000/invoices/new`
2. **Log in** as test user: `test@invoice-builder.com` / `TestPassword123!`
3. **Fill in required fields:**
   - Invoice #: "INV-001" (or any text)
   - Business: Select "Acme Corporation LLC" or "TechStart Innovations"
   - Client: Select any client (GlobalTech Industries, etc.)
   - Currency: Should default to first currency (already selected)
4. **Add line item:**
   - Click "Add Item" button
   - Select an item from dropdown (Website Design, Logo Design, etc.)
   - Adjust quantity if needed (defaults to 1)
5. **Click "Create Invoice"**
6. **Expected result:** 
   - ✅ Success toast: "Invoice created successfully!"
   - ✅ Redirect to `/invoices` page
   - ✅ Invoice appears in list

## Build Status
✅ TypeScript compilation: **0 errors**
✅ Next.js build: **Successful**
✅ All NOT NULL fields: **Now properly initialized**

## Files Modified
- `components/forms/invoice/InvoiceForm.tsx` - Added all missing NOT NULL field defaults
- `lib/hooks/useItemsRetrieve.ts` - Added unit name JOIN
- `app/invoices/new/page.tsx` - Added toast notifications
- `scripts/seed-sample-data.js` - Uses service role key
- `scripts/check-data.js` - Data verification utility
- `INVOICE_CREATION_FIX.md` - This documentation

## Next Steps After Successful Invoice Creation
1. View invoice list at `/invoices`
2. Test editing an invoice
3. Test invoice PDF generation (if implemented)
4. Consider implementing RLS policies review (see SAMPLE_DATA_SETUP.md)
5. Review database security and rotate service role key if needed

---

## Issue 3: Foreign Key Constraint on Line Items

### Error
```
Failed to add invoice items: insert or update on table "invoice_items" violates foreign key constraint "invoice_items_item_id_fkey"
```

### Root Cause
The database schema requires `item_id` to be NOT NULL and reference a valid item in the `items` table. When users added a line item without selecting from the dropdown (itemId = 0), it tried to insert 0 which doesn't exist in the items table.

### Database Constraint
```sql
item_id INTEGER NOT NULL REFERENCES items(id)
```

This means custom/ad-hoc line items are **not supported** in the current schema. Every line item must reference an existing item from the items table.

### Fix Applied

**1. useInvoiceAdd.ts - Filter out invalid items**
```typescript
// Filter out custom items (itemId = 0) as they don't have a valid foreign key reference
const validItems = invoiceItems.filter(item => item.itemId > 0);
```

**2. InvoiceForm.tsx - Updated validation**
```typescript
const hasValidItems = (form.invoiceItems?.filter(item => item.itemId > 0).length ?? 0) > 0;
const isValid = !!(form.invoiceNumber && form.businessId && form.clientId && hasValidItems);
```

**3. InvoiceForm.tsx - Removed "Custom Product/Service" option**
- Removed the `<SelectItem value="0">Custom Product/Service</SelectItem>` from dropdown
- Changed placeholder from "Custom Product/Service" to "Select an item..."
- Users must now select an existing item from the dropdown

**4. app/invoices/new/page.tsx - Updated error message**
- Toast now says: "Please fill in all required fields (Invoice #, Business, Client) and add at least one item from the dropdown"

### Result
- ✅ Create Invoice button is disabled until at least one valid item (itemId > 0) is selected
- ✅ No foreign key constraint errors
- ✅ Invoice items are properly saved with valid item references

### Future Enhancement Option
To support custom/ad-hoc line items, the schema would need to be modified:
```sql
ALTER TABLE invoice_items ALTER COLUMN item_id DROP NOT NULL;
```
This would allow `item_id` to be NULL for custom items, relying only on the snapshot fields.


---

## Issue 4: Selected Item Not Showing in Dropdown

### Problem
After selecting an item from the dropdown, the selected item's name wasn't being displayed. The dropdown would just show the placeholder "Select an item..." even after selecting.

### Root Cause
The `Select` component had `value={String(item.itemId)}` which was "0" for new line items. Since we removed the `<SelectItem value="0">` option, the Select component couldn't find a matching option and defaulted to showing the placeholder.

### Fix Applied

**InvoiceForm.tsx - Conditional value prop**
```typescript
// Before
value={String(item.itemId)}

// After
value={item.itemId > 0 ? String(item.itemId) : undefined}
```

When `itemId = 0` (unselected), the value is `undefined`, which tells the Select component to show the placeholder. Once an item is selected (itemId > 0), the value matches a SelectItem and the component displays the selected item's name.

### Result
- ✅ Placeholder "Select an item..." shows when no item selected
- ✅ Selected item name displays correctly after selection
- ✅ Dropdown behaves as expected in controlled component pattern


---

## UX Enhancement: Validation Feedback

### Improvement
Added real-time validation feedback to help users understand what's missing before they can create an invoice.

### Implementation

**app/invoices/new/page.tsx - Added `getValidationMessage()` function**
```typescript
const getValidationMessage = () => {
  if (!formData?.invoice) return 'Fill in invoice details';
  
  const missing = [];
  if (!formData.invoice.invoiceNumber) missing.push('Invoice #');
  if (!formData.invoice.businessId || formData.invoice.businessId === 0) missing.push('Business');
  if (!formData.invoice.clientId || formData.invoice.clientId === 0) missing.push('Client');
  
  const validItems = formData.invoice.invoiceItems?.filter(item => item.itemId > 0).length ?? 0;
  if (validItems === 0) missing.push('at least one item');
  
  if (missing.length === 0) return '';
  return `Missing: ${missing.join(', ')}`;
};
```

### Features
1. **Visible text next to button** - Shows what's missing (e.g., "Missing: Invoice #, Business")
2. **Tooltip on hover** - Same message appears when hovering over disabled button
3. **Dynamic updates** - Message updates as user fills in fields
4. **Toast on click** - If button clicked while disabled, shows error toast with specific message

### User Experience
- **Before:** Button disabled with no explanation
- **After:** Users see exactly what's missing: "Missing: Invoice #, Business, Client, at least one item"
- As fields are filled, the message updates in real-time
- Button enables automatically when all requirements met

### Result
- ✅ Clear validation feedback
- ✅ Better user guidance
- ✅ Reduced confusion about why button is disabled
- ✅ Professional UX pattern


---

## Issue 5: Validation Not Recognizing Selected Item

### Problem
After selecting an item from the dropdown, the validation message still showed "Missing: at least one item" and the Create Invoice button remained disabled.

### Root Cause
The item selection handler was calling `updateItem()` 4 times sequentially:
```typescript
updateItem(index, 'itemId', saved.id);
updateItem(index, 'itemNameSnapshot', saved.name);
updateItem(index, 'unitPriceCentsSnapshot', Number(saved.amount) * 100);
updateItem(index, 'unitNameSnapshot', saved.unitName || '');
```

Each call triggered a separate state update, creating a race condition. The validation would run before all 4 updates completed, so it would check the state when only 1 or 2 fields were updated.

### Fix Applied

**InvoiceForm.tsx - Batch update all fields at once**
```typescript
// Before: 4 separate updates (race condition)
updateItem(index, 'itemId', saved.id);
updateItem(index, 'itemNameSnapshot', saved.name);
// ... 2 more calls

// After: Single atomic update
const newItems = [...(form.invoiceItems || [])];
newItems[index] = {
  ...newItems[index],
  itemId: saved.id,
  itemNameSnapshot: saved.name,
  unitPriceCentsSnapshot: Number(saved.amount) * 100,
  unitNameSnapshot: saved.unitName || ''
};
update('invoiceItems', newItems);
```

### Result
- ✅ All item fields update atomically in a single state change
- ✅ Validation runs after all fields are set
- ✅ "Missing: at least one item" disappears immediately after selection
- ✅ Create Invoice button enables correctly
- ✅ No race conditions


---

## Issue 6: User Not Found Error

### Problem
When clicking "Create Invoice", got error: "User not found"

### Root Cause
The user session has expired or is not properly authenticated in the browser. The `supabase.auth.getUser()` call returns null when there's no valid session.

### Fix Applied

**useInvoiceAdd.ts - Better error handling and logging**
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError) {
  console.error('Auth error:', authError);
  return { success: false, message: `Authentication error: ${authError.message}` };
}

if (!user) {
  console.error('No user found in session');
  return { success: false, message: 'Please log in again. Your session may have expired.' };
}
```

### Solution: Re-login

**Steps to fix:**

1. **Open browser** at `localhost:3000/invoices/new`
2. **Check if you see the login page** - if yes, you're logged out
3. **If you see the invoice form, your session might be stale**
4. **Clear and re-login:**
   - Open browser DevTools (F12)
   - Go to Application tab → Storage → Clear site data
   - Navigate to `localhost:3000/login`
   - Log in as: `test@invoice-builder.com` / `TestPassword123!`
5. **Navigate back to** `/invoices/new`
6. **Try creating invoice again**

### Improved Error Messages
- ✅ Shows specific authentication error if any
- ✅ Better message: "Please log in again. Your session may have expired."
- ✅ Console logs to help debug
- ✅ Toast notification shows the error

### Prevention
Supabase sessions typically last 1 hour by default. If you're testing for long periods, you may need to refresh your login.


---

## Issue 7: Can't Delete Invoice

### Problem
Clicking the delete button on an invoice didn't delete it. No error shown, nothing happened.

### Root Cause
The `useInvoiceDelete` hook was initialized with a hardcoded `id: 0`:
```typescript
const { execute: deleteInvoice } = useInvoiceDelete({
  id: 0,  // ❌ Always trying to delete invoice with id=0
  immediate: false,
  onDone: (res) => {
    if (res.success) refreshInvoices();
  }
});
```

The `handleDelete(id)` function received the correct invoice ID but never passed it to the hook. The hook would always try to delete invoice with id=0, which doesn't exist.

### Fix Applied

**app/invoices/page.tsx - Dynamic ID with state and useEffect**

1. Added state to track which invoice to delete:
```typescript
const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);
```

2. Pass the dynamic ID to the hook:
```typescript
const { execute: deleteInvoice } = useInvoiceDelete({
  id: invoiceToDelete || 0,
  immediate: false,
  onDone: (res) => {
    if (res.success) {
      toast.success('Invoice deleted successfully');
      refreshInvoices();
      setInvoiceToDelete(null);
    } else {
      toast.error(res.message || 'Failed to delete invoice');
      setInvoiceToDelete(null);
    }
  }
});
```

3. Trigger delete when ID is set:
```typescript
React.useEffect(() => {
  if (invoiceToDelete) {
    deleteInvoice();
  }
}, [invoiceToDelete, deleteInvoice]);
```

4. Simplified handleDelete:
```typescript
const handleDelete = (id: number) => {
  if (confirm('Are you sure you want to delete this invoice?')) {
    setInvoiceToDelete(id);  // Setting state triggers useEffect
  }
};
```

### Additional Improvements
- ✅ Added toast notifications: "Invoice deleted successfully"
- ✅ Error handling: Shows error message if delete fails
- ✅ Confirmation dialog: "Are you sure you want to delete this invoice? This action cannot be undone."
- ✅ List auto-refreshes after successful deletion

### Result
- ✅ Delete button now works correctly
- ✅ Correct invoice is deleted (not always id=0)
- ✅ User gets immediate feedback via toast
- ✅ Invoice list updates automatically
- ✅ Clean error handling

