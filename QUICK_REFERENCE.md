# Quick Reference

## Field Configuration Cheat Sheet

### Field Structure
```typescript
{
  name: string;           // Required: Field identifier
  title: string;          // Required: Display label
  type: FieldType;        // Required: Data type
  visible?: boolean;      // Show in table (default: true)
  filterable?: boolean;   // Enable filter (default: false)
  sortable?: boolean;     // Enable sort (default: false)
  showInDetail?: boolean; // Show in detail view (default: false)
  editable?: boolean;     // Allow edit (default: false)
  accessor?: string;      // Alternative field path
  placeholder?: string;   // Input placeholder
  defaultValue?: any;     // Default for new records
  renderCell?: Function;  // Custom cell render
  renderEdit?: Function;  // Custom form input
}
```

### Field Types Quick Reference

| Type | Filter Operation | Use Case |
|------|------------------|----------|
| `String` | CONTAIN | Text search |
| `Integer` | EQUAL | Numeric values |
| `Boolean` | SPECIFIED | True/False values |
| `Enum` | EQUAL (multi) | Dropdown selections |
| `Date` | Range | Date picker |
| `DateSec` | Range | Unix timestamp (seconds) |
| `DateTimeSec` | Range | Unix timestamp with time |
| `Image` | CONTAIN | File URLs |
| `RichText` | CONTAIN | HTML content |

### Common Field Patterns

**ID Field (Read-only)**
```typescript
{ name: "id", title: "ID", type: "Integer", visible: true, sortable: true, editable: false }
```

**Name Field (Searchable)**
```typescript
{ name: "name", title: "Name", type: "String", visible: true, filterable: true, sortable: true, editable: true }
```

**Status Field (Enum)**
```typescript
{ 
  name: "status", 
  title: "Status", 
  type: "Enum", 
  enumValues: { ACTIVE: "Active", INACTIVE: "Inactive" },
  visible: true, 
  filterable: true, 
  editable: true 
}
```

**Created Date (Timestamp)**
```typescript
{ name: "createdAt", title: "Created", type: "DateTimeSec", visible: true, filterable: true, sortable: true, editable: false }
```

**Active Flag (Boolean)**
```typescript
{ name: "active", title: "Active", type: "Boolean", visible: true, filterable: true, editable: true }
```

## DynamicQueryTable Props

```typescript
<DynamicQueryTable
  fields={Field[]}              // Required: Field definitions
  apiUrl={string}               // Required: API endpoint
  idField="id"                  // Primary key field name
  defaultSortField="id"         // Initial sort field
  pageSize={20}                 // Rows per page
  enableFilter={true}           // Show filter panel
  enableSelection={false}       // Enable row selection
  enableCreate={false}          // Show create button
  enableEdit={false}            // Show edit button
  onRowSelect={(rows) => {}}    // Selection callback
  onDataChange={(data) => {}}   // Data change callback
/>
```

## URL Query Format Examples

**Basic Filter**
```
?key0=name&operation0=CONTAIN&values0=john
```

**Multiple Filters**
```
?key0=name&operation0=CONTAIN&values0=john&key1=age&operation1=GREATER_THAN&values1=25
```

**With Pagination**
```
?page=0&pageSize=20
```

**With Sorting**
```
?orderBy0=name&orderByDirection0=asc
```

**Complete Example**
```
?key0=status&operation0=EQUAL&values0=ACTIVE&page=0&pageSize=20&orderBy0=createdAt&orderByDirection0=desc
```

## Criteria Operations

| Operation | Description | Example |
|-----------|-------------|---------|
| `CONTAIN` | Contains substring | `name CONTAINS "john"` |
| `DOES_NOT_CONTAIN` | Not contains | `name NOT CONTAINS "test"` |
| `START_WITH` | Starts with | `email STARTS WITH "admin"` |
| `END_WITH` | Ends with | `email ENDS WITH ".com"` |
| `EQUAL` | Equals | `status = "ACTIVE"` |
| `NOT_EQUAL` | Not equals | `status != "DELETED"` |
| `GREATER_THAN` | Greater than | `age > 18` |
| `GREATER_THAN_OR_EQUAL` | >= | `age >= 18` |
| `LESS_THAN` | Less than | `age < 65` |
| `LESS_THAN_OR_EQUAL` | <= | `age <= 65` |
| `SPECIFIED` | Is not null | `email IS NOT NULL` |

## Custom Renderers

**Custom Cell**
```typescript
renderCell: (value, row) => {
  return <Badge>{value}</Badge>;
}
```

**Custom Form Input**
```typescript
renderEdit: (value, onChange) => {
  return <CustomInput value={value} onChange={onChange} />;
}
```

## Spring Page Response Format

```typescript
{
  content: T[],           // Array of data
  totalElements: number,  // Total items
  totalPages: number,     // Total pages
  number: number,         // Current page (0-indexed)
  size: number,          // Page size
  first: boolean,        // Is first page
  last: boolean,         // Is last page
  empty: boolean,        // Is empty
  numberOfElements: number  // Items in current page
}
```

## Common Tasks

**Add a new field type to filter**
```typescript
const fields = [...existingFields, {
  name: "newField",
  title: "New Field",
  type: "String",
  filterable: true,  // Enable filtering
}];
```

**Make a field editable**
```typescript
{
  name: "description",
  title: "Description",
  type: "String",
  editable: true,  // Allow editing
  showInDetail: true,
}
```

**Add custom styling to a cell**
```typescript
{
  name: "status",
  title: "Status",
  type: "String",
  renderCell: (value) => (
    <span className={value === "active" ? "text-green-600" : "text-red-600"}>
      {value}
    </span>
  ),
}
```

**Change default page size**
```typescript
<DynamicQueryTable
  fields={fields}
  apiUrl="/api/data"
  pageSize={50}  // Default 20
/>
```

## TypeScript Helpers

**Get field value type**
```typescript
type FieldValue<T extends Field> = T extends BaseField<infer V> ? V : never;
```

**Infer row type from fields**
```typescript
type InferRowData<T extends Field[]> = {
  [K in T[number]["name"]]: FieldValue<Extract<T[number], { name: K }>>;
};
```

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## File Locations

- **Field Types**: `lib/types/field.types.ts`
- **Query Builder**: `lib/utils/query-builder.ts`
- **Main Table**: `components/dynamic-query-table/table.tsx`
- **Filter**: `components/dynamic-query-table/filter.tsx`
- **Form**: `components/dynamic-query-table/form.tsx`
- **Example**: `app/example/page.tsx`

## Tips

1. Always set `editable: false` for ID fields
2. Use `DateTimeSec` for timestamps from backend
3. Enable `filterable` only on searchable fields for better UX
4. Use `accessor` for nested object fields (e.g., "user.address.city")
5. Custom renderers override default field type rendering
6. URL state is automatically synced - perfect for sharing filtered views
7. Filter panel pin state persists in localStorage
8. Use TypeScript strict mode for better type safety

