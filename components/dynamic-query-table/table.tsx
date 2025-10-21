"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Eye, RefreshCw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Field, SpringPage, CriteriaOperation } from "@/lib/types/field.types";
import { QueryBuilder } from "@/lib/utils/query-builder";
import { FilterPanel } from "./filter";
import { Pagination } from "./pagination";
import { DetailView } from "./detail-view";
import { Form } from "./form";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";

interface DynamicQueryTableProps<T = any> {
  fields: Field[];
  apiUrl: string;
  idField?: string;
  defaultSortField?: string;
  pageSize?: number;
  enableFilter?: boolean;
  enableSelection?: boolean;
  enableCreate?: boolean;
  enableEdit?: boolean;
  onRowSelect?: (rows: T[]) => void;
  onDataChange?: (data: SpringPage<T>) => void;
}

export function DynamicQueryTable<T = any>({
  fields,
  apiUrl,
  idField = "id",
  defaultSortField = "id",
  pageSize = 20,
  enableFilter = true,
  enableSelection = false,
  enableCreate = false,
  enableEdit = false,
  onRowSelect,
  onDataChange,
}: DynamicQueryTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<SpringPage<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [queryBuilder, setQueryBuilder] = useState<QueryBuilder>(
    new QueryBuilder()
  );
  const [detailData, setDetailData] = useState<T | null>(null);
  const [formData, setFormData] = useState<T | null | undefined>(undefined);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  // Initialize column visibility
  useEffect(() => {
    const visibility = fields.reduce((acc, field) => {
      acc[field.name] = field.visible !== false;
      return acc;
    }, {} as Record<string, boolean>);
    setColumnVisibility(visibility);
  }, [fields]);

  // Initialize query builder from URL
  useEffect(() => {
    const queryString = searchParams.toString();
    if (queryString) {
      const builder = new QueryBuilder();
      builder.fromQueryString(queryString);
      setQueryBuilder(builder);
    } else {
      // Set defaults
      const builder = new QueryBuilder();
      builder.setPage(0);
      builder.setPageSize(pageSize);
      builder.setSort(defaultSortField, "desc");
      setQueryBuilder(builder);
    }
  }, []);

  // Fetch data when query changes
  useEffect(() => {
    if (queryBuilder.query) {
      fetchData();
    }
  }, [queryBuilder]);

  // Update URL when query changes
  const updateUrl = useCallback(() => {
    const queryString = queryBuilder.toQueryString();
    router.replace(`?${queryString}`, { scroll: false });
  }, [queryBuilder, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryString = queryBuilder.toQueryString();
      const response = await fetch(`${apiUrl}?${queryString}`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result: SpringPage<T> = await response.json();
      setData(result);
      setSelectedRows(new Set());
      if (onDataChange) {
        onDataChange(result);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // In a real app, you'd want to show an error toast/notification
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    // Reset to first page when filters change
    queryBuilder.setPage(0);
    setQueryBuilder(new QueryBuilder(queryBuilder.query));
    updateUrl();
  };

  const handlePageChange = (page: number) => {
    queryBuilder.setPage(page);
    setQueryBuilder(new QueryBuilder(queryBuilder.query));
    updateUrl();
  };

  const handlePageSizeChange = (newPageSize: number) => {
    queryBuilder.setPageSize(newPageSize);
    queryBuilder.setPage(0); // Reset to first page
    setQueryBuilder(new QueryBuilder(queryBuilder.query));
    updateUrl();
  };

  const handleSort = (field: Field) => {
    if (field.sortable === false) return;

    const fieldName = field.accessor || field.name;
    const currentSort = queryBuilder.query.orderBy?.[0];
    const currentDirection = queryBuilder.query.orderByDirection?.[0];

    let newDirection: "asc" | "desc" = "desc";
    if (currentSort === fieldName && currentDirection === "desc") {
      newDirection = "asc";
    }

    queryBuilder.setSort(fieldName, newDirection);
    setQueryBuilder(new QueryBuilder(queryBuilder.query));
    updateUrl();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && data) {
      const allIds = data.content.map((row: any) => row[idField]);
      setSelectedRows(new Set(allIds));
      if (onRowSelect) {
        onRowSelect(data.content);
      }
    } else {
      setSelectedRows(new Set());
      if (onRowSelect) {
        onRowSelect([]);
      }
    }
  };

  const handleRowSelect = (id: any, checked: boolean) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedRows(newSelection);
    if (onRowSelect && data) {
      const selected = data.content.filter((row: any) =>
        newSelection.has(row[idField])
      );
      onRowSelect(selected);
    }
  };

  const handleClearFilters = () => {
    queryBuilder.clearCriteria();
    queryBuilder.setPage(0);
    queryBuilder.setPageSize(pageSize);
    queryBuilder.setSort(defaultSortField, "desc");
    setQueryBuilder(new QueryBuilder(queryBuilder.query));
    updateUrl();
  };

  const handleFormSubmit = async (formData: any) => {
    // In a real implementation, you would POST/PUT to an API endpoint
    console.log("Form submitted:", formData);
    // Refresh data after submission
    await fetchData();
  };

  const getFieldValue = (row: any, field: Field): any => {
    const path = (field.accessor || field.name).split(".");
    let value = row;
    for (const key of path) {
      if (value && typeof value === "object") {
        value = value[key];
      } else {
        return null;
      }
    }
    return value;
  };

  const renderCellValue = (field: Field, value: any, row: any) => {
    // Use custom renderer if provided
    if (field.renderCell) {
      return field.renderCell(value, row);
    }

    // Handle null/undefined
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">--</span>;
    }

    switch (field.type) {
      case "Boolean":
        return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>;

      case "Enum":
        return <span>{field.enumValues[value] || value}</span>;

      case "DateSec":
      case "DateTimeSec":
        try {
          const date = new Date(value * 1000);
          return <span>{format(date, "PPp")}</span>;
        } catch {
          return <span>{value}</span>;
        }

      case "Date":
        try {
          const date = typeof value === "string" ? new Date(value) : value;
          return <span>{format(date, "PPp")}</span>;
        } catch {
          return <span>{value}</span>;
        }

      case "Image":
        return (
          <img
            src={value}
            alt={field.title}
            className="h-10 w-10 object-cover rounded"
          />
        );

      case "RichText":
        const stripped = value.replace(/<[^>]*>/g, "").substring(0, 50);
        return <span>{stripped}...</span>;

      default:
        const text = value.toString();
        if (text.length > 50) {
          return (
            <span title={text}>
              {text.substring(0, 50)}...
            </span>
          );
        }
        return <span>{text}</span>;
    }
  };

  const visibleFields = fields.filter((f) => columnVisibility[f.name]);
  const currentSort = queryBuilder.query.orderBy?.[0];
  const currentDirection = queryBuilder.query.orderByDirection?.[0];

  return (
    <div className="space-y-4">
      {enableFilter && (
        <FilterPanel
          fields={fields}
          queryBuilder={queryBuilder}
          onFilterChange={handleFilterChange}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {enableCreate && (
            <Button onClick={() => setFormData(null)}>
              Create New
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchData()}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          {enableFilter && (
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">Column Visibility</div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      const allVisible = fields.reduce((acc, field) => {
                        acc[field.name] = true;
                        return acc;
                      }, {} as Record<string, boolean>);
                      setColumnVisibility(allVisible);
                    }}
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      const allHidden = fields.reduce((acc, field) => {
                        acc[field.name] = false;
                        return acc;
                      }, {} as Record<string, boolean>);
                      setColumnVisibility(allHidden);
                    }}
                  >
                    None
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {fields.map((field) => (
                  <div key={field.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={`col-${field.name}`}
                      checked={columnVisibility[field.name]}
                      onCheckedChange={(checked) =>
                        setColumnVisibility({
                          ...columnVisibility,
                          [field.name]: checked as boolean,
                        })
                      }
                    />
                    <label
                      htmlFor={`col-${field.name}`}
                      className="text-sm cursor-pointer"
                    >
                      {field.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {enableSelection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      data &&
                      data.content.length > 0 &&
                      selectedRows.size === data.content.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {visibleFields.map((field) => (
                <TableHead
                  key={field.name}
                  className={cn(field.sortable !== false && "cursor-pointer")}
                  onClick={() => handleSort(field)}
                >
                  <div className="flex items-center gap-2">
                    {field.title}
                    {field.sortable !== false && (
                      <ArrowUpDown
                        className={cn(
                          "h-4 w-4",
                          currentSort === (field.accessor || field.name) &&
                            "text-primary"
                        )}
                      />
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={
                    visibleFields.length + (enableSelection ? 2 : 1)
                  }
                  className="text-center h-24"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : data && data.content.length > 0 ? (
              data.content.map((row: any) => {
                const rowId = row[idField];
                const isSelected = selectedRows.has(rowId);
                return (
                  <TableRow
                    key={rowId}
                    data-state={isSelected && "selected"}
                  >
                    {enableSelection && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleRowSelect(rowId, checked as boolean)
                          }
                        />
                      </TableCell>
                    )}
                    {visibleFields.map((field) => (
                      <TableCell key={field.name}>
                        {renderCellValue(field, getFieldValue(row, field), row)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDetailData(row)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {enableEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setFormData(row)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={
                    visibleFields.length + (enableSelection ? 2 : 1)
                  }
                  className="text-center h-24"
                >
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.totalElements > 0 && (
        <Pagination
          page={data}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {detailData && (
        <DetailView
          data={detailData}
          fields={fields}
          open={!!detailData}
          onClose={() => setDetailData(null)}
        />
      )}

      {formData !== undefined && (
        <Form
          data={formData}
          fields={fields}
          open={formData !== undefined}
          onClose={() => setFormData(undefined)}
          onSubmit={handleFormSubmit}
          idField={idField}
        />
      )}
    </div>
  );
}

