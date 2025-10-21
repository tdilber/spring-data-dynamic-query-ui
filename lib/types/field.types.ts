/**
 * Spring Dynamic Query UI - Type Definitions
 * 
 * These types match the Spring Dynamic Query argument resolver format
 * to ensure full compatibility with the backend.
 */

import { ReactNode } from "react";

/**
 * Operations matching Spring CriteriaOperation enum
 */
export enum CriteriaOperation {
  CONTAIN = "CONTAIN",
  DOES_NOT_CONTAIN = "DOES_NOT_CONTAIN",
  END_WITH = "END_WITH",
  START_WITH = "START_WITH",
  SPECIFIED = "SPECIFIED",
  EQUAL = "EQUAL",
  NOT_EQUAL = "NOT_EQUAL",
  GREATER_THAN = "GREATER_THAN",
  GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
  LESS_THAN = "LESS_THAN",
  LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",
}

/**
 * Single criteria matching Spring Criteria format
 * 
 * Example URL format:
 * key0=name&operation0=CONTAIN&values0=test
 */
export interface Criteria {
  key: string;
  operation: CriteriaOperation;
  values: string[];
}

/**
 * Dynamic query structure matching Spring DynamicQuery argument resolver
 * 
 * Example URL format:
 * key0=name&operation0=CONTAIN&values0=test&page=0&pageSize=20&orderBy0=id&orderByDirection0=desc
 */
export interface DynamicQuery {
  criteria: Criteria[];
  select?: string[];
  selectAs?: string[];
  orderBy?: string[];
  orderByDirection?: ("asc" | "desc")[];
  page?: number;
  pageSize?: number;
}

/**
 * Spring Page response format
 */
export interface SpringPage<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

/**
 * Base Field interface (like Java base class)
 * Contains common properties for all field types
 */
export interface BaseField<T = any> {
  /** Field identifier (e.g., "id", "user.name" for nested fields) */
  name: string;
  /** Display label for the field */
  title: string;
  /** Show column in table (default: true) */
  visible?: boolean;
  /** Enable filtering (default: false) */
  filterable?: boolean;
  /** Enable sorting (default: false) */
  sortable?: boolean;
  /** Show in detail view (default: false) */
  showInDetail?: boolean;
  /** Allow editing in form (default: false) */
  editable?: boolean;
  /** Alternative field path (for nested fields or when name differs from accessor) */
  accessor?: string;
  /** Input placeholder text */
  placeholder?: string;
  /** Default value for new records */
  defaultValue?: T;
  /** Custom cell renderer for table display */
  renderCell?: (value: T, row: any) => ReactNode;
  /** Custom input renderer for form editing */
  renderEdit?: (value: T, onChange: (val: T) => void, row?: any) => ReactNode;
}

/**
 * String field type
 * Uses CONTAIN operation by default for filtering
 */
export interface StringField extends BaseField<string> {
  type: "String";
}

/**
 * Integer field type
 * Uses EQUAL operation by default for filtering
 */
export interface IntegerField extends BaseField<number> {
  type: "Integer";
}

/**
 * Boolean field type
 * Uses SPECIFIED operation for filtering
 */
export interface BooleanField extends BaseField<boolean> {
  type: "Boolean";
}

/**
 * Date field type (JavaScript Date object)
 * Uses GREATER_THAN_OR_EQUAL and LESS_THAN_OR_EQUAL for range filtering
 */
export interface DateField extends BaseField<Date | string> {
  type: "Date";
}

/**
 * Date field with Unix timestamp in seconds
 * Uses GREATER_THAN_OR_EQUAL and LESS_THAN_OR_EQUAL for range filtering
 */
export interface DateSecField extends BaseField<number> {
  type: "DateSec";
}

/**
 * DateTime field with Unix timestamp in seconds
 * Uses GREATER_THAN_OR_EQUAL and LESS_THAN_OR_EQUAL for range filtering
 */
export interface DateTimeSecField extends BaseField<number> {
  type: "DateTimeSec";
}

/**
 * Enum field type with predefined values
 * Uses EQUAL operation with multiple values for filtering
 */
export interface EnumField extends BaseField<string> {
  type: "Enum";
  /** Required: Map of enum keys to human-readable labels */
  enumValues: Record<string, string>;
  /** Allow multiple selection in filter (default: true) */
  multiSelect?: boolean;
}

/**
 * Image field type for file uploads
 * Stores image URL/path as string
 */
export interface ImageField extends BaseField<string> {
  type: "Image";
  /** Required: Image upload description/config identifier */
  uploadConfig: string;
  /** Optional: Maximum file size in bytes */
  maxSize?: number;
  /** Optional: Allowed MIME types (e.g., ["image/jpeg", "image/png"]) */
  allowedTypes?: string[];
}

/**
 * Rich text field type for HTML content
 * Stores HTML as string
 */
export interface RichTextField extends BaseField<string> {
  type: "RichText";
  /** Optional: Rich text editor configuration */
  editorConfig?: Record<string, any>;
}

/**
 * Union type for all field types
 * Provides discriminated union for type safety
 */
export type Field =
  | StringField
  | IntegerField
  | BooleanField
  | DateField
  | DateSecField
  | DateTimeSecField
  | EnumField
  | ImageField
  | RichTextField;

/**
 * Helper type to extract field value type from Field
 */
export type FieldValue<T extends Field> = T extends BaseField<infer V>
  ? V
  : never;

/**
 * Helper type to infer row data type from field array
 */
export type InferRowData<T extends Field[]> = {
  [K in T[number]["name"]]: FieldValue<Extract<T[number], { name: K }>>;
};

