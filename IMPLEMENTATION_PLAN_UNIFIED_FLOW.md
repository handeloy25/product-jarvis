# Implementation Plan: Unified Product Creation Flow

**Created:** 2026-01-08
**Status:** APPROVED - Ready for Implementation
**Estimated Phases:** 8

---

## Problem Statement

The current product creation flow is fragmented:
1. User creates product → manually enters estimated value (pointless)
2. User saves product
3. User edits product to do valuation (separate session)
4. User edits product again to add documents (third session)

**Goal:** Single wizard flow that creates a fully-valued product in one session.

---

## Agreed Solution

### New Flow

```
Add Product Button
        ↓
┌─────────────────────────────────┐
│  Step 1: Basic Info             │
│  - Name, Description            │
│  - Product Type (Internal/Ext)  │
│  - Requestor (BU or Dept)       │
│  - NO estimated_value field     │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  Step 2: Choose Valuation Type  │
│                                 │
│  [Quick Estimate]  [Full Val]   │
│   ~2 min, Low      ~15 min,     │
│   confidence       Higher conf  │
└─────────────────────────────────┘
        ↓                    ↓
┌───────────────┐    ┌───────────────┐
│ Step 3a:      │    │ Step 3b:      │
│ Built-in Calc │    │ External Tool │
│               │    │               │
│ Internal:     │    │ Use Valuation │
│ - Hrs/user/wk │    │ Assistant     │
│ - Num users   │    │ externally    │
│ - Hourly cost │    │               │
│               │    │ Then enter:   │
│ External:     │    │ - Value       │
│ - TAM         │    │ - Paste raw   │
│ - Serviceable%│    │   output      │
│ - Market share│    │               │
│ - Deal size   │    │               │
│ - Margin%     │    │               │
│ - Lifetime    │    │               │
└───────────────┘    └───────────────┘
        ↓                    ↓
        └────────┬───────────┘
                 ↓
┌─────────────────────────────────┐
│  Step 4: Confirmation           │
│  - Show calculated value        │
│  - Show valuation type badge    │
│  - Assign Service Departments   │
│  - Done → Product saved         │
└─────────────────────────────────┘
```

### Quick Estimate Calculator (Built-in)

**Internal Products:**
```
Annual Value = Hours Saved/User/Week × Number of Users × Hourly Cost × 52 weeks
```
- Uses default strategic scores (all 3s)
- Confidence level: Always "Low"
- Inputs stored as JSON for audit trail

**External Products:**
```
Addressable Customers = TAM × Serviceable% × Market Share%
Annual Value = Customers × Deal Size × Margin% × (Lifetime Months / 12)
```
- Uses default strategic scores (all 3s)
- Confidence level: Always "Low"
- Inputs stored as JSON for audit trail

### Full Valuation (External Tool)

1. User opens external Valuation Assistant (Internal or External based on product type)
2. Completes guided valuation conversation
3. Gets calculated value + raw output text
4. Returns to wizard
5. Enters: calculated value + pastes raw output
6. Product saves with `valuation_type: 'full'`, higher confidence

---

## Database Changes

### Products Table - New Columns

```sql
ALTER TABLE products ADD COLUMN valuation_type TEXT CHECK (valuation_type IN ('quick', 'full'));
ALTER TABLE products ADD COLUMN valuation_confidence TEXT DEFAULT 'Low';
ALTER TABLE products ADD COLUMN quick_estimate_inputs TEXT;  -- JSON storage
```

### Products Table - Remove from Form

- `estimated_value` - still exists in DB but NOT shown in Add form
- Value will be calculated and set programmatically

### Status Values Update

Current: `Ideation`, `In Development`, `Live`, `Deprecated`
Add: `Draft` - for products abandoned mid-wizard

---

## New Components

### 1. QuickEstimateCalculator.jsx

**Location:** `frontend/src/components/QuickEstimateCalculator.jsx`

**Props:**
- `productType` ('Internal' | 'External')
- `onCalculate(value, inputs)` - callback with result

**Internal Form Fields:**
- Hours Saved / User / Week (number)
- Number of Users (number)
- Avg Hourly Cost (currency, default $50)

**External Form Fields:**
- Total Potential Customers (number)
- Serviceable % (number, default 20)
- Market Share % (number, default 5)
- Average Deal Size (currency)
- Gross Margin % (number, default 70)
- Customer Lifetime Months (number, default 24)

**Output:**
- Calculated annual value displayed
- "Continue" button enabled when all fields filled

### 2. ProductCreationWizard.jsx

**Location:** `frontend/src/components/ProductCreationWizard.jsx`

**State:**
- `step` (1-4)
- `formData` (all fields)
- `valuationType` ('quick' | 'full' | null)
- `calculatedValue` (number)
- `rawOutput` (string, for full valuation)

**Step Navigation:**
- Back button (except step 1)
- Progress indicator
- Cancel → Saves as Draft with confirmation

**Integration:**
- Step 3a uses QuickEstimateCalculator
- Step 4 uses existing DepartmentManager component

### 3. ProductDetailPage.jsx

**Location:** `frontend/src/pages/ProductDetailPage.jsx`

**Route:** `/products/:id`

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ [Back] Product Name                    [Edit]   │
│ Status Badge | Type Badge | Valuation Badge     │
│ Estimated Value: $X,XXX/mo                      │
├─────────────────────────────────────────────────┤
│ [Overview] [Documents] [Valuation] [Tasks]      │
├─────────────────────────────────────────────────┤
│                                                 │
│  Tab Content Area                               │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Tabs:**
- **Overview:** Description, Requestor, Service Departments, Created/Updated dates
- **Documents:** Links to Raw Valuation, User Flow, Specs, Persona Feedback (with status icons)
- **Valuation:** Readonly display of inputs used (Quick or Full)
- **Tasks:** Task list from Calculator (reuse existing component)

---

## File Modifications

### backend/database.py

Add to `new_product_doc_columns` list:
```python
("valuation_type", "TEXT"),
("valuation_confidence", "TEXT DEFAULT 'Low'"),
("quick_estimate_inputs", "TEXT"),
```

Add 'Draft' to status check if using CHECK constraint.

### backend/models/product.py

```python
ProductStatus = Literal["Draft", "Ideation", "In Development", "Live", "Deprecated"]
ValuationType = Literal["quick", "full"]

class ProductBase(BaseModel):
    # ... existing fields ...
    valuation_type: Optional[ValuationType] = None
    valuation_confidence: Optional[str] = "Low"
    quick_estimate_inputs: Optional[str] = None  # JSON string
```

### backend/routers/products.py

- Validate `valuation_type` on create/update
- Add `GET /api/products/{id}/full` endpoint that includes all document content

### frontend/src/pages/ProductsPage.jsx

**Remove from ProductForm:**
- `estimated_value` input field (lines ~612-625 and ~765-775)

**Add to table columns:**
- Valuation Type column (Quick/Full badge)
- Persona column (clickable like Flow/Specs)

**Replace for new products:**
- "Add Product" button opens ProductCreationWizard instead of ProductForm

**Keep ProductForm for:**
- Edit mode only (simplified: name, description, status, type)
- Show `estimated_value` as readonly display

### frontend/src/App.jsx

Add route:
```jsx
<Route path="/products/:id" element={<ProductDetailPage />} />
```

---

## UI/UX Details

### Valuation Type Badges

```jsx
// Quick Estimate
<span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
  Quick
</span>

// Full Valuation
<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
  Full
</span>
```

### Draft Status Badge

```jsx
<span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
  Draft
</span>
```

### Wizard Step Indicator

```
Step 1    Step 2    Step 3    Step 4
  ●─────────○─────────○─────────○
Basic     Method   Valuation  Confirm
```

### Quick Estimate Tip Banner

```jsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
  <p className="text-sm text-blue-800">
    <strong>Tip:</strong> Quick estimates use default strategic scores (all 3s) 
    and Low confidence. Use the full wizard for more accurate valuations.
  </p>
</div>
```

---

## Implementation Order

| Phase | Description | Files | Complexity |
|-------|-------------|-------|------------|
| 1 | Database schema updates | `database.py`, `models/product.py` | Low |
| 2 | Backend API updates | `routers/products.py` | Low |
| 3 | QuickEstimateCalculator component | New file | Medium |
| 4 | ProductCreationWizard component | New file | High |
| 5 | ProductsPage updates | `ProductsPage.jsx` | Medium |
| 6 | ProductDetailPage | New file | Medium |
| 7 | App.jsx route updates | `App.jsx` | Low |
| 8 | Testing & Polish | All | Medium |

---

## Acceptance Criteria

### Must Have (MVP)
- [ ] Add Product opens wizard, not simple form
- [ ] Step 1 collects basic info WITHOUT estimated_value
- [ ] Step 2 offers Quick Estimate vs Full Valuation choice
- [ ] Quick Estimate calculates value from inputs (Internal & External formulas)
- [ ] Full Valuation requires pasting raw output before save
- [ ] Products show valuation_type badge (Quick/Full) in table
- [ ] Persona Feedback column added to products table
- [ ] Draft status for abandoned wizards

### Nice to Have (MVP2)
- [ ] Auto-extract value from pasted raw output
- [ ] Product detail page with tabs
- [ ] Resume wizard from Draft status
- [ ] Valuation comparison (Quick vs Full for same product)

---

## Testing Checklist

1. **New Internal Product - Quick Estimate**
   - Create product → Quick Estimate → Enter hours/users/cost → See calculated value → Assign dept → Done
   - Verify: valuation_type = 'quick', confidence = 'Low', estimated_value calculated correctly

2. **New External Product - Quick Estimate**
   - Create product → Quick Estimate → Enter TAM/share/deal/margin/lifetime → See calculated value → Done
   - Verify: valuation_type = 'quick', estimated_value calculated correctly

3. **New Product - Full Valuation**
   - Create product → Full Valuation → See external tool instructions → Enter value + paste output → Done
   - Verify: valuation_type = 'full', raw_valuation_output saved

4. **Abandoned Wizard**
   - Start wizard → Cancel mid-way → Confirm save as Draft
   - Verify: status = 'Draft', product appears in table with Draft badge

5. **Edit Existing Product**
   - Edit product → See simplified form (no estimated_value input) → Change name → Save
   - Verify: Original valuation data preserved

6. **Table Display**
   - Verify: Valuation Type column shows Quick/Full badges
   - Verify: Persona column is clickable like Flow/Specs

---

## Rollback Plan

If issues arise:
1. Database columns are additive (no destructive changes)
2. Old ProductForm preserved in codebase (can revert App.jsx import)
3. New components are isolated files (can delete without affecting existing)

---

## Questions Resolved

| Question | Decision |
|----------|----------|
| Parse value from raw output? | MVP2 - manual entry for now |
| Allow incomplete products? | Yes - save as Draft with warning |
| Product detail page? | Yes - personas recommend full page over modal |
| Persona Feedback column? | Yes - add to table |

---

*Plan approved: 2026-01-08*
*Ready for implementation*
