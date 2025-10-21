# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2025-01-XX

### Added
- Initial release of Spring Dynamic Query UI
- Apache License 2.0 (matching Spring JPA Dynamic Query)
- DynamicQueryTable component with full CRUD support
- FilterPanel component with collapsible/pinnable design
- Pagination component matching Spring Page format
- DetailView component for record display
- Form component for create/edit operations
- QueryBuilder utility for Spring-compatible query generation
- Support for 9 field types: String, Integer, Boolean, Date, DateSec, DateTimeSec, Enum, Image, RichText
- URL state synchronization
- Row selection with bulk actions
- Column visibility toggle
- Sortable columns
- Mock API endpoint for testing
- Comprehensive TypeScript types
- Complete documentation and examples

### Features
- Spring Dynamic Query format compliance (key0, operation0, values0)
- Type-safe field definitions with discriminated unions
- Custom cell and form renderers
- Extensible architecture for adding new field types
- Responsive design with Tailwind CSS
- Modern UI components from shadcn/ui
- Persistent filter panel state with localStorage
- Server-side pagination
- Advanced filtering with multiple operations per field type

### Components
- `DynamicQueryTable` - Main table component
- `FilterPanel` - Advanced filtering UI
- `Pagination` - Page navigation
- `DetailView` - Record detail modal
- `Form` - CRUD form with validation
- All shadcn/ui base components

### Utilities
- `QueryBuilder` - URL query string management
- `cn` - Tailwind class name merger

### Types
- Complete TypeScript definitions
- Field type system
- Spring Page format types
- Criteria and DynamicQuery types

