# Bond Generator Services

Production-grade bond certificate generation services. **Excel-only for v1** - deterministic, reliable parsing.

## Architecture

```
lib/services/bond-generator/
├── principalWords.ts       (127 lines) - Pure function: number → words
├── bondNumbering.ts        (110 lines) - Pure function: sort + number bonds
├── maturityParser.ts       (252 lines) - Excel parser with validation
├── cusipParser.ts          (201 lines) - Excel parser with validation
├── bondAssembler.ts        (237 lines) - Main orchestrator
└── index.ts                ( 17 lines) - Barrel exports

Total: 944 lines
```

## Design Principles

1. **Deterministic Assembly** - Same inputs always produce same outputs
2. **No Database Writes** - Pure data processing, returns JSON
3. **Hard Stops Over Inference** - Fail fast with clear errors
4. **Comprehensive Logging** - Every step logged with context
5. **PII Redaction** - All logs automatically redacted via logger
6. **Sentry Integration** - Errors captured with breadcrumbs

## Usage Example

```typescript
import { assembleBonds } from '@/lib/services/bond-generator';

// User uploads two Excel files
const maturityBuffer = await readFile('maturity-schedule.xlsx');
const cusipBuffer = await readFile('cusip-file.xlsx');

// Assemble bonds
const result = await assembleBonds({
  maturityBuffer,
  cusipBuffer
});

if (!result.data) {
  // Handle error
  console.error(result.error.message);
  return;
}

// Success - bonds ready for template generation
const bonds = result.data;
console.log(`Generated ${bonds.length} bonds`);
console.log(`Dated: ${bonds[0].dated_date}`);
console.log(`First bond: ${bonds[0].bond_number}`);
```

## Output Format

Each assembled bond contains:

```typescript
{
  bond_number: "2026A-001",           // Formatted number
  series: "2026A",                     // Optional
  maturity_date: "2045-06-01",        // ISO date
  principal_amount: 5000000,          // Whole dollars
  principal_words: "FIVE MILLION DOLLARS",
  coupon_rate: 4.25,                  // Percentage
  cusip_no: "71885KAA4",              // 9-char CUSIP
  dated_date: "2026-01-15"            // ISO date
}
```

## Excel File Requirements

### Maturity Schedule

Required columns (case-insensitive):
- `Maturity Date` - Date format
- `Principal Amount` - **Must be whole numbers** (no decimals)
- `Coupon Rate` - Percentage (e.g., 4.25)
- `Dated Date` - Single date value (can be in first data row)
- `Series` - Optional, text

### CUSIP File

Required columns:
- `CUSIP` - 9 alphanumeric characters
- `Maturity Date` - Must match maturity schedule dates
- `Series` - Optional, must match if present

## Error Handling

All functions return `ServiceResult<T>`:

```typescript
type ServiceResult<T> = 
  | { data: T; error: null }
  | { data: null; error: ServiceError }
```

Common errors:
- `PARSING_ERROR` - Invalid Excel format or missing columns
- `VALIDATION_ERROR` - Data validation failed (decimals in principal, missing CUSIP, etc.)
- `INTERNAL_ERROR` - Unexpected system error

## Validation Rules

### Hard Stops (Fail Immediately)

1. **Principal amounts must be whole numbers**
   - ❌ 1,500,000.50
   - ✅ 1500000

2. **CUSIP must be exactly 9 alphanumeric characters**
   - ❌ 71885K (too short)
   - ✅ 71885KAA4

3. **Every maturity must have exactly one CUSIP**
   - ❌ No matching CUSIP → Error
   - ❌ Multiple matching CUSIPs → Error
   - ✅ One matching CUSIP → Success

4. **Dates must be valid**
   - Supports: Excel date numbers, ISO strings, common formats
   - Output: Always ISO format (YYYY-MM-DD)

## Bond Numbering Rules

Deterministic sort order:
1. Series (ascending, null last)
2. Maturity date (ascending)
3. Principal amount (**descending** - larger amounts first)
4. CUSIP (ascending)

Format:
- With series: `{series}-{seq}` (e.g., "2026A-001")
- Without series: `BOND-{seq}` (e.g., "BOND-001")

## Testing

Test individual services:

```typescript
// Test pure functions
import { principalToWords } from '@/lib/services/bond-generator';
console.log(principalToWords(5000000)); // "FIVE MILLION DOLLARS"

// Test parsers
import { parseMaturityExcel } from '@/lib/services/bond-generator';
const buffer = await readFile('test.xlsx');
const result = await parseMaturityExcel(buffer);
```

## Next Steps (Future Enhancements)

- [ ] Add PDF parsing with AI validation UI (Claude Vision)
- [ ] Add DOCX template generation (docxtemplater)
- [ ] Add PDF output conversion
- [ ] Add database persistence (optional job tracking)
- [ ] Add batch processing for large issuances

## Standards Compliance

✅ Uses `lib/errors/ApiError` ServiceResult pattern  
✅ Uses `lib/logger` with PII redaction  
✅ Sentry integration for error tracking  
✅ TypeScript strict mode  
✅ No `any` types  
✅ Explicit return types  
✅ Comprehensive JSDoc comments  
✅ Zero linter errors  

---

**Version:** 1.0.0 (Excel-only, deterministic assembly)  
**Created:** 2026-01-14
