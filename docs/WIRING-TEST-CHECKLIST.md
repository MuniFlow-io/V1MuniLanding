# 🔌 Wiring Test Checklist - Bond Generator

**Purpose:** Verify every step actually works end-to-end

---

## ✅ What I Just Fixed

### Issue 1: Database Schema Mismatch ✅ FIXED
- **Error:** "Could not find 'cusip_file' column"
- **Cause:** Migration SQL missing JSONB columns
- **Fix:** Updated `supabase-migrations.sql` with correct schema
- **Status:** Database saves now return 200 (working!)

### Issue 2: Template File Not Saved to State ✅ FIXED
- **Error:** TemplateTagging component receives `templateFile={null}`
- **Cause:** `uploadTemplate()` function never called `setTemplateFile()`
- **Fix:** Added `setTemplateFile(fileToUpload)` in uploadTemplate function
- **Status:** File should now be passed to next step

---

## 🧪 Step-by-Step Test (Do This After Refresh)

### Step 1: Legal Disclaimer
1. Go to http://localhost:3000/bond-generator/workbench
2. **Expected:** Legal disclaimer modal appears
3. **Action:** Click "I Accept"
4. **Expected:** Modal closes, upload screen appears

**✅ Pass / ❌ Fail:** _______

---

### Step 2: Upload Template
1. **Action:** Drag a .docx file or click to browse
2. **Expected:** 
   - File name appears below drop zone
   - File size shown (in KB)
3. **Action:** File automatically proceeds to tagging step (no button click needed)
4. **Expected:** Screen changes to tagging view

**✅ Pass / ❌ Fail:** _______

**Debug if fail:**
- Check browser console for errors
- Check Network tab - is template file being uploaded?
- Check terminal - any errors?

---

### Step 3: Template Tagging
**Expected to see:**
- Left side (2/3 width): Document viewer with HTML preview of your DOCX
- Right side (1/3 width): Tag progress panel showing 6 required tags
- Bottom: "← Back" and "Continue →" buttons

**What should work:**
1. Document renders in iframe (white background, your DOCX content visible)
2. You can select text in the document
3. Popup menu appears when you select text
4. You can assign tags (CUSIP, Principal, etc.)
5. Progress panel updates as tags are assigned
6. "Continue" button is disabled until all 6 required tags assigned

**✅ Pass / ❌ Fail:** _______

**Debug if fail:**
- Is `templateFile` null? (check React DevTools)
- Does `/api/bond-generator/template/preview` return 200?
- Check browser console for preview loading errors
- Check Network tab for the preview API call

---

### Step 4: Upload Data Files
**Expected:**
- Two upload zones (Maturity Schedule, CUSIP Schedule)
- Upload both .xlsx files
- "Continue" button appears when both uploaded

**✅ Pass / ❌ Fail:** _______

---

### Step 5: Preview Data
**Expected:**
- Two editable tables appear:
  - Maturity Schedule table (columns: Date, Principal, Rate, etc.)
  - CUSIP Schedule table (columns: CUSIP, Date, Series)
- Data is parsed from your Excel files
- You can click cells to edit
- "Continue to Assembly" button enabled

**✅ Pass / ❌ Fail:** _______

**Debug if fail:**
- Check `/api/bond-generator/parse-maturity` returns 200
- Check `/api/bond-generator/parse-cusip` returns 200
- Check browser console for parsing errors

---

### Step 6: Generate Bonds
**Expected:**
- Summary of bonds to be generated
- "Generate Bonds" button
- Click generates ZIP file

**✅ Pass / ❌ Fail:** _______

---

### Step 7: Complete
**Expected:**
- Success message
- Download button for ZIP
- "Start New Generation" button

**✅ Pass / ❌ Fail:** _______

---

## 🔍 Common Issues & Fixes

### Issue: "Document preview will appear here" (placeholder)
**Cause:** TemplateTagging component not receiving templateFile  
**Fix:** Already applied - refresh browser

### Issue: Template preview API returns 401/403
**Cause:** Auth headers not being sent  
**Fix:** Check `getAuthHeadersForFormData()` function

### Issue: Preview shows but can't click to tag
**Cause:** PostMessage not working between iframe and parent  
**Fix:** Check browser console for postMessage errors

### Issue: Tables are empty in Step 5
**Cause:** Parse APIs not returning data properly  
**Fix:** Check API response structure matches what DataPreview expects

---

## 🐛 Debug Commands

### Check if file is in state:
Open React DevTools → Components → find `BondGeneratorWorkbenchPage` → look at hook values

### Check API calls:
Open Network tab → filter by "bond-generator" → check each API call status

### Check console errors:
Open Console tab → look for red errors

---

## ✅ Success Criteria

All steps should work without:
- ❌ 500 errors in terminal
- ❌ Console errors in browser
- ❌ Placeholder text showing
- ❌ Null values where data should be

You should be able to:
- ✅ Upload template → See document preview
- ✅ Tag template → Assign all required tags
- ✅ Upload schedules → See parsed data in tables
- ✅ Generate bonds → Download ZIP

---

**After testing, report back which step fails so I can fix it!**
