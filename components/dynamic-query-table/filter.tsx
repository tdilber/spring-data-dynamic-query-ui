"use client";

import React, { useEffect, useState } from "react";
import { Filter, ChevronDown, ChevronUp, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils/cn";
import { Field, CriteriaOperation } from "@/lib/types/field.types";
import { QueryBuilder } from "@/lib/utils/query-builder";
import { format } from "date-fns";

interface FilterPanelProps {
  fields: Field[];
  queryBuilder: QueryBuilder;
  onFilterChange: () => void;
}

export function FilterPanel({
  fields,
  queryBuilder,
  onFilterChange,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [dateRanges, setDateRanges] = useState<Record<string, { from?: Date; to?: Date }>>({});

  // Load pinned state from localStorage
  useEffect(() => {
    const savedPinState = localStorage.getItem("filterPinned");
    if (savedPinState) {
      const pinned = JSON.parse(savedPinState);
      setIsPinned(pinned);
      if (pinned) {
        setIsExpanded(true);
      }
    }
  }, []);

  // Get filterable fields
  const filterableFields = fields.filter((f) => f.filterable);

  // Count active filters
  const activeFilterCount = queryBuilder.query.criteria.length;

  const toggleExpand = () => {
    if (!isPinned) {
      setIsExpanded(!isExpanded);
    }
  };

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newPinState = !isPinned;
    setIsPinned(newPinState);
    if (newPinState) {
      setIsExpanded(true);
    }
    localStorage.setItem("filterPinned", JSON.stringify(newPinState));
  };

  const handleStringFilter = (field: Field, value: string) => {
    const fieldName = field.accessor || field.name;
    if (value) {
      queryBuilder.upsertCriteria(fieldName, CriteriaOperation.CONTAIN, [value]);
    } else {
      queryBuilder.removeCriteriaByKey(fieldName);
    }
    onFilterChange();
  };

  const handleIntegerFilter = (field: Field, value: string) => {
    const fieldName = field.accessor || field.name;
    if (value) {
      queryBuilder.upsertCriteria(fieldName, CriteriaOperation.EQUAL, [value]);
    } else {
      queryBuilder.removeCriteriaByKey(fieldName);
    }
    onFilterChange();
  };

  const handleBooleanFilter = (field: Field, checked: boolean) => {
    const fieldName = field.accessor || field.name;
    if (checked) {
      queryBuilder.upsertCriteria(fieldName, CriteriaOperation.SPECIFIED, ["true"]);
    } else {
      queryBuilder.removeCriteriaByKey(fieldName);
    }
    onFilterChange();
  };

  const handleEnumFilter = (field: Field & { type: "Enum" }, value: string) => {
    const fieldName = field.accessor || field.name;
    if (value) {
      queryBuilder.upsertCriteria(fieldName, CriteriaOperation.EQUAL, [value]);
    } else {
      queryBuilder.removeCriteriaByKey(fieldName);
    }
    onFilterChange();
  };

  const handleDateRangeFilter = (field: Field, range: { from?: Date; to?: Date }) => {
    const fieldName = field.accessor || field.name;
    setDateRanges({ ...dateRanges, [fieldName]: range });

    queryBuilder.removeCriteriaByKey(fieldName);

    if (range.from) {
      const value = field.type === "DateSec" || field.type === "DateTimeSec"
        ? Math.floor(range.from.getTime() / 1000).toString()
        : range.from.toISOString();
      queryBuilder.addCriteria(
        fieldName,
        CriteriaOperation.GREATER_THAN_OR_EQUAL,
        [value]
      );
    }

    if (range.to) {
      const value = field.type === "DateSec" || field.type === "DateTimeSec"
        ? Math.floor(range.to.getTime() / 1000).toString()
        : range.to.toISOString();
      queryBuilder.addCriteria(
        fieldName,
        CriteriaOperation.LESS_THAN_OR_EQUAL,
        [value]
      );
    }

    onFilterChange();
  };

  const getFilterValue = (field: Field): string => {
    const fieldName = field.accessor || field.name;
    const values = queryBuilder.getCriteriaValues(fieldName);
    return values[0] || "";
  };

  const getBooleanValue = (field: Field): boolean => {
    const fieldName = field.accessor || field.name;
    return queryBuilder.hasCriteria(fieldName, CriteriaOperation.SPECIFIED);
  };

  const renderFilterInput = (field: Field) => {
    const fieldName = field.accessor || field.name;

    switch (field.type) {
      case "String":
      case "RichText":
        return (
          <Input
            placeholder={field.placeholder || `Filter ${field.title}...`}
            value={getFilterValue(field)}
            onChange={(e) => handleStringFilter(field, e.target.value)}
          />
        );

      case "Integer":
        return (
          <Input
            type="number"
            placeholder={field.placeholder || `Filter ${field.title}...`}
            value={getFilterValue(field)}
            onChange={(e) => handleIntegerFilter(field, e.target.value)}
          />
        );

      case "Boolean":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`filter-${fieldName}`}
              checked={getBooleanValue(field)}
              onCheckedChange={(checked) =>
                handleBooleanFilter(field, checked as boolean)
              }
            />
            <label
              htmlFor={`filter-${fieldName}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.title}
            </label>
          </div>
        );

      case "Enum":
        return (
          <Select
            value={getFilterValue(field) || undefined}
            onValueChange={(value) => handleEnumFilter(field, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.title}`} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(field.enumValues).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "Date":
      case "DateSec":
      case "DateTimeSec":
        const currentRange = dateRanges[fieldName] || {};
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                {currentRange.from ? (
                  currentRange.to ? (
                    <>
                      {format(currentRange.from, "LLL dd, y")} -{" "}
                      {format(currentRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(currentRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={currentRange}
                onSelect={(range) =>
                  handleDateRangeFilter(field, range || {})
                }
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        );

      case "Image":
        return (
          <Input
            placeholder="Filter by image URL..."
            value={getFilterValue(field)}
            onChange={(e) => handleStringFilter(field, e.target.value)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg mb-4">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePin}
          className={cn(isPinned && "text-primary")}
        >
          <Pin
            className={cn(
              "h-4 w-4 transition-transform",
              isPinned ? "rotate-0" : "rotate-45"
            )}
          />
        </Button>
      </div>

      {isExpanded && (
        <div className="p-4 border-t space-y-4">
          {filterableFields.map((field) => (
            <div key={field.name} className="space-y-2">
              {field.type !== "Boolean" && (
                <Label htmlFor={`filter-${field.accessor || field.name}`}>
                  {field.title}
                </Label>
              )}
              {renderFilterInput(field)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

