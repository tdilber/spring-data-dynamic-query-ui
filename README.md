# Spring Dynamic Query UI

A modern, type-safe React component library built with Next.js 14, TypeScript, and shadcn/ui for [Spring Dynamic Query](https://github.com/tdilber/spring-jpa-dynamic-query). This library provides a complete data table solution with advanced filtering, sorting, pagination, and CRUD operations that generates Spring-compatible query parameters.

## Features

- 🎯 **Spring Compatible** - Generates URL parameters that match Spring Dynamic Query argument resolver format exactly
- 🔍 **Advanced Filtering** - Multiple field types with intelligent filtering (String, Integer, Boolean, Enum, Date, Image, RichText)
- 📊 **Sortable Columns** - Click-to-sort with ASC/DESC toggle
- 📄 **Server-side Pagination** - Efficient pagination matching Spring Page format
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 📱 **Responsive Design** - Works on all screen sizes
- 🔗 **URL State Management** - All filters, sorting, and pagination synced with URL for sharing/bookmarking
- 🎭 **Type Safe** - Full TypeScript support with discriminated unions
- 🧩 **Extensible** - Easy to add custom field types and renderers
- 📝 **CRUD Operations** - Built-in create, read, update forms
- 👁️ **Detail View** - Modal detail view for records
- ✅ **Row Selection** - Multi-row selection with bulk actions
- 🎛️ **Column Visibility** - Show/hide columns dynamically
- 📌 **Persistent Filters** - Pin filter panel open with localStorage

## Installation

### Option 1: Clone from GitHub (Recommended - shadcn Style)

This library follows the shadcn/ui philosophy - copy the components you need directly into your project for full customization.

```bash
# Clone the repository
git clone https://github.com/tdilber/spring-dynamic-query-ui.git

# Copy the components you need to your project
cp -r spring-dynamic-query-ui/components/dynamic-query-table your-project/components/
cp -r spring-dynamic-query-ui/lib your-project/lib/

# Install required shadcn/ui components
npx shadcn-ui@latest add button input label checkbox badge table dialog select popover calendar

# Install additional dependencies
npm install date-fns lucide-react
```

### Option 2: Use as Reference

Browse the code on GitHub and copy specific components:
- **Main Component**: [components/dynamic-query-table/table.tsx](https://github.com/tdilber/spring-dynamic-query-ui/blob/main/components/dynamic-query-table/table.tsx)
- **Filter Panel**: [components/dynamic-query-table/filter.tsx](https://github.com/tdilber/spring-dynamic-query-ui/blob/main/components/dynamic-query-table/filter.tsx)
- **Form**: [components/dynamic-query-table/form.tsx](https://github.com/tdilber/spring-dynamic-query-ui/blob/main/components/dynamic-query-table/form.tsx)
- **Types**: [lib/types/field.types.ts](https://github.com/tdilber/spring-dynamic-query-ui/blob/main/lib/types/field.types.ts)
- **Query Builder**: [lib/utils/query-builder.ts](https://github.com/tdilber/spring-dynamic-query-ui/blob/main/lib/utils/query-builder.ts)

## Quick Start

```typescript
import { DynamicQueryTable } from "@/components/dynamic-query-table";
import { Field } from "@/lib/types/field.types";

const fields: Field[] = [
  {
    name: "id",
    title: "ID",
    type: "Integer",
    visible: true,
    filterable: true,
    sortable: true,
    showInDetail: true,
    editable: false,
  },
  {
    name: "name",
    title: "Name",
    type: "String",
    visible: true,
    filterable: true,
    sortable: true,
    showInDetail: true,
    editable: true,
    placeholder: "Enter name...",
  },
  {
    name: "status",
    title: "Status",
    type: "Enum",
    enumValues: {
      ACTIVE: "Active",
      INACTIVE: "Inactive",
      PENDING: "Pending",
    },
    visible: true,
    filterable: true,
    sortable: true,
    showInDetail: true,
    editable: true,
  },
];

export default function MyPage() {
  return (
    <DynamicQueryTable
      fields={fields}
      apiUrl="/api/users"
      enableFilter={true}
      enableSelection={true}
      enableCreate={true}
      enableEdit={true}
      pageSize={20}
    />
  );
}
```

## Field Configuration

### Base Field Properties

All field types extend from `BaseField` and support these common properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ✅ | Field identifier (e.g., "id", "user.name" for nested) |
| `title` | string | ✅ | Display label |
| `type` | FieldType | ✅ | Data type (see Field Types below) |
| `visible` | boolean | ❌ | Show column in table (default: true) |
| `filterable` | boolean | ❌ | Enable filtering (default: false) |
| `sortable` | boolean | ❌ | Enable sorting (default: false) |
| `showInDetail` | boolean | ❌ | Show in detail view (default: false) |
| `editable` | boolean | ❌ | Allow editing in form (default: false) |
| `accessor` | string | ❌ | Alternative field path for nested objects |
| `placeholder` | string | ❌ | Input placeholder text |
| `defaultValue` | any | ❌ | Default value for new records |
| `renderCell` | function | ❌ | Custom cell renderer: `(value, row) => ReactNode` |
| `renderEdit` | function | ❌ | Custom edit input: `(value, onChange) => ReactNode` |

### Field Types

#### StringField
```typescript
{
  type: "String",
  name: "email",
  title: "Email",
  filterable: true, // Uses CONTAIN operation
}
```

#### IntegerField
```typescript
{
  type: "Integer",
  name: "age",
  title: "Age",
  filterable: true, // Uses EQUAL operation
}
```

#### BooleanField
```typescript
{
  type: "Boolean",
  name: "active",
  title: "Active",
  filterable: true, // Uses SPECIFIED operation
}
```

#### EnumField
```typescript
{
  type: "Enum",
  name: "status",
  title: "Status",
  enumValues: {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
  },
  filterable: true, // Uses EQUAL with multiple values
}
```

#### DateField
```typescript
{
  type: "Date",
  name: "createdAt",
  title: "Created At",
  filterable: true, // Date range with GREATER_THAN_OR_EQUAL + LESS_THAN_OR_EQUAL
}
```

#### DateSecField
```typescript
{
  type: "DateSec",
  name: "timestamp",
  title: "Timestamp",
  filterable: true, // Unix timestamp in seconds
}
```

#### DateTimeSecField
```typescript
{
  type: "DateTimeSec",
  name: "lastLogin",
  title: "Last Login",
  filterable: true, // Unix timestamp with time
}
```

#### ImageField
```typescript
{
  type: "Image",
  name: "avatar",
  title: "Avatar",
  uploadConfig: "user-avatar", // Required
  maxSize: 5242880, // 5MB
  allowedTypes: ["image/jpeg", "image/png"],
}
```

#### RichTextField
```typescript
{
  type: "RichText",
  name: "description",
  title: "Description",
  editorConfig: { /* custom editor config */ },
}
```

## Component API

### DynamicQueryTable

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fields` | Field[] | required | Field definitions |
| `apiUrl` | string | required | Data endpoint URL |
| `idField` | string | "id" | Primary key field name |
| `defaultSortField` | string | "id" | Initial sort field |
| `pageSize` | number | 20 | Rows per page |
| `enableFilter` | boolean | true | Show filter panel |
| `enableSelection` | boolean | false | Enable row selection |
| `enableCreate` | boolean | false | Show create button |
| `enableEdit` | boolean | false | Show edit button |
| `onRowSelect` | function | - | Callback: `(rows) => void` |
| `onDataChange` | function | - | Callback: `(data) => void` |

## URL Query Format

The component generates Spring-compatible query parameters:

### Filtering
```
key0=name&operation0=CONTAIN&values0=john
key1=age&operation1=GREATER_THAN&values1=25
```

### Pagination
```
page=0&pageSize=20
```

### Sorting
```
orderBy0=name&orderByDirection0=asc
```

### Complete Example
```
?key0=name&operation0=CONTAIN&values0=john&page=0&pageSize=20&orderBy0=createdAt&orderByDirection0=desc
```

## API Response Format

Your backend should return data in Spring Page format:

```typescript
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 5,
  "totalElements": 100,
  "last": false,
  "size": 20,
  "number": 0,
  "sort": {
    "sorted": true,
    "unsorted": false,
    "empty": false
  },
  "numberOfElements": 20,
  "first": true,
  "empty": false
}
```

## Custom Renderers

### Custom Cell Renderer

```typescript
{
  name: "status",
  title: "Status",
  type: "String",
  renderCell: (value, row) => {
    return (
      <Badge variant={value === "active" ? "default" : "secondary"}>
        {value}
      </Badge>
    );
  },
}
```

### Custom Edit Renderer

```typescript
{
  name: "tags",
  title: "Tags",
  type: "String",
  renderEdit: (value, onChange) => {
    return (
      <MultiSelect
        value={value}
        onChange={onChange}
        options={tagOptions}
      />
    );
  },
}
```

## Extending Field Types

To add a new field type:

1. Add the type to `lib/types/field.types.ts`:

```typescript
interface CustomField extends BaseField<string> {
  type: "Custom";
  customConfig?: any;
}

export type Field = 
  | StringField 
  | IntegerField 
  // ... existing types
  | CustomField;
```

2. Add rendering logic in the table/filter/form components

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Validation**: Zod

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

This project is licensed under the same license as [Spring JPA Dynamic Query](https://github.com/tdilber/spring-jpa-dynamic-query) for consistency across the ecosystem.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Related Projects

- [Spring JPA Dynamic Query](https://github.com/tdilber/spring-jpa-dynamic-query) - Backend library

## Author

Created with ❤️ for the Spring Dynamic Query ecosystem

