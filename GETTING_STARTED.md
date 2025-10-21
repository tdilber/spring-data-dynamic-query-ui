# Getting Started with Spring Dynamic Query UI

This guide will help you get started with the Spring Dynamic Query UI library.

## Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm
- Basic knowledge of React and Next.js
- A Spring Boot backend with Spring Dynamic Query (optional for development)

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd spring-dynamic-query-ui
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the home page.

Navigate to [http://localhost:3000/example](http://localhost:3000/example) to see the example table.

## Project Structure

```
spring-dynamic-query-ui/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   └── gifts/               # Mock API endpoint
│   │       └── route.ts
│   ├── example/                  # Example page
│   │   └── page.tsx
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── dynamic-query-table/     # Main library components
│   │   ├── detail-view.tsx      # Detail modal
│   │   ├── filter.tsx           # Filter panel
│   │   ├── form.tsx             # CRUD form
│   │   ├── index.ts             # Exports
│   │   ├── pagination.tsx       # Pagination
│   │   └── table.tsx            # Main table
│   └── ui/                      # shadcn/ui components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── checkbox.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       ├── select.tsx
│       └── table.tsx
├── lib/                         # Utilities and types
│   ├── types/
│   │   └── field.types.ts      # TypeScript definitions
│   └── utils/
│       ├── cn.ts               # Class name utility
│       └── query-builder.ts    # Query builder
├── legacy_code/                # Original implementation reference
└── ...config files
```

## Basic Usage

### 1. Define Your Fields

Create a field configuration array:

```typescript
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
  },
];
```

### 2. Use the DynamicQueryTable Component

```typescript
import { DynamicQueryTable } from "@/components/dynamic-query-table";

export default function MyPage() {
  return (
    <DynamicQueryTable
      fields={fields}
      apiUrl="/api/your-endpoint"
      enableFilter={true}
      pageSize={20}
    />
  );
}
```

### 3. Create Your API Endpoint

Your backend should accept Spring Dynamic Query parameters and return Spring Page format:

```typescript
// app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Parse query parameters
  const page = parseInt(searchParams.get("page") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  
  // Parse criteria
  // key0=name&operation0=CONTAIN&values0=john
  
  // Fetch data from your backend
  const response = await fetch(`http://your-backend-api/endpoint?${searchParams.toString()}`);
  const data = await response.json();
  
  return NextResponse.json(data);
}
```

## Field Type Examples

### String Field
```typescript
{
  name: "email",
  title: "Email",
  type: "String",
  filterable: true,
  placeholder: "Enter email...",
}
```

### Enum Field
```typescript
{
  name: "status",
  title: "Status",
  type: "Enum",
  enumValues: {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
  },
  filterable: true,
}
```

### Date Field
```typescript
{
  name: "createdAt",
  title: "Created At",
  type: "DateTimeSec",
  filterable: true,
  sortable: true,
}
```

### Boolean Field
```typescript
{
  name: "verified",
  title: "Verified",
  type: "Boolean",
  filterable: true,
}
```

## Advanced Features

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

### Custom Form Input

```typescript
{
  name: "tags",
  title: "Tags",
  type: "String",
  renderEdit: (value, onChange) => {
    return (
      <MyCustomMultiSelect
        value={value}
        onChange={onChange}
      />
    );
  },
}
```

### Row Selection

```typescript
<DynamicQueryTable
  fields={fields}
  apiUrl="/api/users"
  enableSelection={true}
  onRowSelect={(rows) => {
    console.log("Selected:", rows);
  }}
/>
```

## Connecting to Spring Backend

If you have a Spring Boot backend with Spring Dynamic Query:

```typescript
// Your frontend API route
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const response = await fetch(
    `http://localhost:8080/api/users?${searchParams.toString()}`
  );
  
  return NextResponse.json(await response.json());
}
```

Your Spring controller:
```java
@GetMapping("/api/users")
public ResponseEntity<Page<User>> getUsers(DynamicQuery dynamicQuery) {
    Page<User> users = userRepository.findAllAsPage(dynamicQuery);
    return ResponseEntity.ok(users);
}
```

## Next Steps

- Explore the [example page](http://localhost:3000/example)
- Read the [full documentation](README.md)
- Check out the [Spring Dynamic Query backend library](https://github.com/tdilber/spring-jpa-dynamic-query)
- Customize field types for your needs
- Add custom renderers and validators

## Troubleshooting

### The table shows "No results found"
- Check that your API endpoint is returning data in Spring Page format
- Verify the API URL is correct
- Check browser console for network errors

### Filters don't work
- Ensure your backend supports the Spring Dynamic Query parameter format
- Check that fields are marked with `filterable: true`
- Verify the criteria are being sent in the URL

### Types are not working correctly
- Make sure you're using TypeScript 5.x or higher
- Check that all field definitions match the Field type union
- Verify your tsconfig.json is properly configured

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Refer to the Spring Dynamic Query documentation

