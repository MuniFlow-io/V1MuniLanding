# Bond Generator Module

Excel-based bond certificate generator following clean architecture principles.

## Architecture

This module follows the **5-layer clean architecture** pattern:

```
BondGeneratorPage (Layer 1: Component)
    ↓ uses
useBondGenerator (Layer 2: Hook)
    ↓ calls
bondGeneratorApi (Layer 3: Frontend API)
    ↓ HTTP
/api/bond-generator/assemble (Layer 4: Backend API)
    ↓ calls
lib/services/bond-generator (Layer 5: Backend Service)
```

## Files Created

### Frontend (modules/bond-generator/)

```
modules/bond-generator/
├── api/
│   └── bondGeneratorApi.ts         # Frontend API (HTTP only)
├── hooks/
│   └── useBondGenerator.ts         # State management hook
├── components/
│   ├── FileUploadCard.tsx          # Dumb UI component
│   ├── BondsPreviewTable.tsx       # Dumb UI component
│   └── StepIndicator.tsx           # Dumb UI component
├── pages/
│   └── BondGeneratorPage.tsx       # Page composition
├── types/
│   └── index.ts                    # TypeScript types
└── index.ts                        # Barrel exports
```

### Backend

```
pages/
├── bond-generator.tsx              # Next.js route
└── api/bond-generator/
    └── assemble.ts                 # Backend API endpoint

lib/services/bond-generator/        # Backend services (already created)
├── principalWords.ts
├── bondNumbering.ts
├── maturityParser.ts
├── cusipParser.ts
├── bondAssembler.ts
└── index.ts
```

### Configuration

- Feature flag: `ENABLE_BOND_GENERATOR` in `lib/config/index.ts`
- Sidebar navigation entry added
- Route: `/bond-generator`

## Usage

Navigate to `/bond-generator` to access the tool.

### Workflow

1. **Upload Files**: Upload maturity schedule (Excel) and CUSIP file (Excel)
2. **Preview**: Review generated bonds in table
3. **Download**: Download bonds as CSV

### Excel File Requirements

**Maturity Schedule:**
- Columns: Maturity Date, Principal Amount, Coupon Rate, Dated Date, Series (optional)
- Principal amounts must be whole numbers (no decimals)

**CUSIP File:**
- Columns: CUSIP, Maturity Date, Series (optional)
- CUSIPs must be 9 alphanumeric characters

## Standards Compliance

✅ **Layer Separation**: Components are dumb, hooks manage state, APIs are pure HTTP  
✅ **No Console.log**: Uses logger in backend only  
✅ **Type Safety**: Full TypeScript coverage  
✅ **Atomic Components**: All components <150 lines  
✅ **Feature Flag**: Protected by `bond_generator` feature flag  
✅ **Zero Linter Errors**: Clean code  

## Future Enhancements

- DOCX template generation (replace CSV output)
- PDF conversion
- Deal-level integration (pull from Term Sheet)
- AI-assisted PDF parsing with validation UI

## Version

**v1.0.0** - Excel-only, CSV output, standalone tool
