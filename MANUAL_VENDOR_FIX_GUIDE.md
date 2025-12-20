# Manual Vendor Fix Guide - Firebase Console

## 🚀 Quick Fix Steps (5 minutes)

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com
2. Select your project: **ar-gifts-crafts**
3. Click **Firestore Database** in the left sidebar

---

### Step 2: Create "AR Gifts Official" Vendor

1. Click on the **vendors** collection
2. Click **+ Add document**
3. Set **Document ID**: `ar_gifts_official`
4. Add these fields one by one:

| Field | Type | Value |
|-------|------|-------|
| `userId` | string | `ar_gifts_official` |
| `businessName` | string | `AR Gifts Official` |
| `businessEmail` | string | `admin@argifts.lk` |
| `businessPhone` | string | `+94771234567` |
| `businessAddress` | string | `Colombo, Sri Lanka` |
| `businessDescription` | string | `Official AR Gifts platform products - curated collection` |
| `businessType` | string | `Official Store` |
| `logo` | string | `https://ui-avatars.com/api/?name=AR+Gifts&background=4f46e5&color=fff&size=200` |
| `banner` | string | `` (leave empty) |
| `status` | string | `approved` |
| `rating` | number | `5` |
| `reviewCount` | number | `0` |
| `totalSales` | number | `0` |
| `totalEarnings` | number | `0` |
| `availableBalance` | number | `0` |
| `pendingBalance` | number | `0` |
| `commissionRate` | number | `0` |
| `createdAt` | timestamp | *Click "Set to server timestamp"* |
| `updatedAt` | timestamp | *Click "Set to server timestamp"* |

5. Click **Save**

✅ **Checkpoint**: You should now see "AR Gifts Official" in your vendors collection

---

### Step 3: Reassign Orphaned Products (DETAILED STEPS)

#### 3.1 Navigate to Products Collection

1. In Firebase Console, you should still be in **Firestore Database**
2. Look at the **left panel** - you'll see a list of collections
3. Click on **`products`** collection (should be in the list)
4. You'll see all your products displayed

---

#### 3.2 Set Up Filter to Find vendor_1 Products

1. Look at the **top of the products list** - you'll see a search/filter bar
2. Click the **"Add filter"** or **filter icon** (looks like a funnel ⋮)
3. A dropdown will appear with three fields:

   **First Dropdown (Field):**
   - Click it and scroll to find `vendorId`
   - Select `vendorId`

   **Second Dropdown (Operator):**
   - Should show options like: `==`, `!=`, `<`, `>`, etc.
   - Select `==` (equals)

   **Third Input Box (Value):**
   - Type: `vendor_1` (exactly as shown, no quotes)

4. Click **"Apply"** or press Enter

**What you should see:** 
- Only products with `vendorId: vendor_1` will show
- You might see 10-30 products

---

#### 3.3 Update Products One by One

**For EACH product in the filtered list:**

1. **Click on the product row** (anywhere on the document)
   - A panel will open on the right showing all fields

2. **Find the `vendorId` field:**
   - Scroll down if needed
   - You'll see: `vendorId: vendor_1`
   - Click the **value** (the `vendor_1` part)
   - Delete `vendor_1`
   - Type: `ar_gifts_official`

3. **Find the `vendorName` field:**
   - Just below `vendorId`
   - You might see: `vendorName: Colombo Gifts` (or similar)
   - Click the **value**
   - Delete the old name
   - Type: `AR Gifts Official`

4. **Save Changes:**
   - Look for **"Update"** button (usually at bottom of panel)
   - Click it
   - You'll see a success message

5. **Close the panel** and move to the next product

---

#### 3.4 Repeat for All vendor_1 Products

Continue steps 3.3 for **every product** in the list until all are updated.

---

#### 3.5 Now Do the Same for vendor_2

1. **Clear the current filter:**
   - Click the **X** or **"Clear filter"** button at the top

2. **Add new filter:**
   - Field: `vendorId`
   - Operator: `==`
   - Value: `vendor_2`
   - Click Apply

3. **Update all these products** (same as step 3.3):
   - Change `vendorId` from `vendor_2` to `ar_gifts_official`
   - Change `vendorName` to `AR Gifts Official`

---

#### 3.6 Finally, Do the Same for vendor_3

1. **Clear filter again**
2. **Add filter:**
   - Field: `vendorId`
   - Operator: `==`
   - Value: `vendor_3`

3. **Update all products**:
   - Change `vendorId` to `ar_gifts_official`
   - Change `vendorName` to `AR Gifts Official`

---

✅ **Checkpoint**: 
- Go back to products collection (clear all filters)
- Search for any product
- Check its `vendorId` - should be either:
  - `sR8Y5HXShvdmNPfQLwhc0V2WTWW2` (Artisan Hub) ✅
  - `ar_gifts_official` (AR Gifts) ✅
  - **NOT** vendor_1, vendor_2, or vendor_3 ❌

---

#### 💡 **Pro Tip - Faster Method (If Many Products):**

If you have 50+ products to update, you can use **Batch Update**:

1. In the filter view, select multiple products (checkboxes on left)
2. Look for "Batch operations" or "..." menu
3. Some Firebase versions allow bulk field updates

**OR** just update them one by one - it's safer and ensures accuracy!

---

### Step 4: Verify the Fix

1. Go back to **vendors** collection
2. You should see:
   - ✅ `sR8Y5HXShvdmNPfQLwhc0V2WTWW2` (Artisan Hub)
   - ✅ `ar_gifts_official` (AR Gifts Official)
   - ❌ NO vendor_1, vendor_2, vendor_3

3. Go to **products** collection
4. Check a few products - none should have `vendorId: vendor_1/2/3`

---

## ✨ You're Done!

Once complete, **refresh your Admin Dashboard** and you should see:
- Artisan Hub ✅
- AR Gifts Official ✅

Both vendors can now be **suspended/activated** successfully!

---

## 🔔 Next: Push Notifications

After you complete this, let me know and I'll implement:
1. Product hiding for suspended vendors
2. Vendor dashboard blocking
3. Push notification system with your VAPID key
