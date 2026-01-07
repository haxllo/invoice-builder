# 🎯 Sample Data Setup - Quick Guide

## Test User Credentials

A test user has been created for you:

- **Email:** `test@invoice-builder.com`
- **Password:** `TestPassword123!`
- **User ID:** `48c5d069-4982-42c9-8c9a-dd3c47502cb4`

---

## 🚀 Quick Setup (2 minutes)

### Step 1: Re-enable Authentication

Open `middleware.ts` and uncomment the authentication check:

```typescript
// Find these lines and UNCOMMENT them:
if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
  return NextResponse.redirect(new URL('/login', request.url))
}
```

### Step 2: Login

1. Go to http://localhost:3000/login
2. Use the test credentials above
3. Click "Sign In to Dashboard"

### Step 3: Create Sample Data

Now that you're logged in, create sample data through the UI:

#### Create a Business:
1. Go to "Businesses" in sidebar
2. Click "Add Business"
3. Fill in:
   - **Name:** Acme Corporation
   - **Abbreviation:** AC
   - **Email:** billing@acme.com
   - **Phone:** +1 (555) 123-4567

#### Create a Client:
1. Go to "Clients" in sidebar
2. Click "New Client"
3. Fill in:
   - **Name:** GlobalTech Industries
   - **Abbreviation:** GT
   - **Email:** client@globaltech.com

#### Create an Item:
1. Go to "Items" in sidebar
2. Click "New Item"
3. Fill in:
   - **Name:** Website Design
   - **Price:** 150
   - **Description:** Custom website design

### Step 4: Create Invoice!
1. Go to "Invoices" → "Create Invoice"
2. Select your business from the "From" dropdown
3. Select your client from the "Bill To" dropdown
4. Click "Add Line Item"
5. Select your item
6. See the totals calculate automatically!

---

## 📝 Alternative: Manual Database Insert

If you want to seed data directly into Supabase:

1. Go to your Supabase Dashboard
2. Navigate to Table Editor
3. Temporarily disable RLS for testing:
   - SQL Editor → Run: `ALTER TABLE units DISABLE ROW LEVEL SECURITY;`
   - (Repeat for categories, currencies if needed)
4. Insert data manually through the Table Editor
5. Re-enable RLS when done

---

## ✅ What You'll See

Once you have data:
- ✅ Business dropdown shows your businesses
- ✅ Client dropdown shows your clients
- ✅ Item dropdown in line items shows your products/services
- ✅ Currency dropdown shows USD, EUR, GBP
- ✅ Unit dropdown shows hours, pcs, days
- ✅ Category dropdown shows your categories

The migrated shadcn components will look beautiful with actual data! 🎨

---

## 🔧 Troubleshooting

**Problem:** Can't see dropdowns populated

**Solution:** Make sure you:
1. Are logged in as the test user
2. Have created at least one business, client, and item
3. Have refreshed the page

**Problem:** RLS errors in console

**Solution:** The user_id in your data must match your logged-in user ID (48c5d069-4982-42c9-8c9a-dd3c47502cb4)

---

## 🎯 Next Steps After Testing

1. **Re-enable authentication** in middleware.ts (if you disabled it)
2. **Test the invoice creation** flow end-to-end
3. **Move to production** with real user signups
4. **Implement database security** (critical before launch!)
