"use client";

import React, { useEffect, useState } from "react";
import { Field } from "@/lib/types/field.types";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FormProps {
  data?: any;
  fields: Field[];
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void | Promise<void>;
  idField?: string;
}

export function Form({
  data,
  fields,
  open,
  onClose,
  onSubmit,
  idField = "id",
}: FormProps) {
  const [formData, setFormData] = useState<any>({});
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editableFields = fields.filter((f) => f.editable);

  // Initialize form data
  useEffect(() => {
    if (data) {
      setFormData(data);
    } else {
      // Set default values for new record
      const defaults = editableFields.reduce((acc, field) => {
        if (field.defaultValue !== undefined) {
          acc[field.name] = field.defaultValue;
        }
        return acc;
      }, {} as any);
      setFormData(defaults);
    }
    setModifiedFields(new Set());
  }, [data, open]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
    setModifiedFields(new Set(modifiedFields).add(fieldName));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRollback = () => {
    if (data) {
      setFormData(data);
    }
    setModifiedFields(new Set());
  };

  const getFieldValue = (field: Field): any => {
    return formData[field.name];
  };

  const renderFieldInput = (field: Field) => {
    const value = getFieldValue(field);
    const isModified = modifiedFields.has(field.name);

    // Use custom renderer if provided
    if (field.renderEdit) {
      return field.renderEdit(value, (newValue) =>
        handleFieldChange(field.name, newValue)
      );
    }

    switch (field.type) {
      case "String":
        return (
          <Input
            value={value || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case "Integer":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) =>
              handleFieldChange(field.name, parseInt(e.target.value, 10) || 0)
            }
            placeholder={field.placeholder}
          />
        );

      case "Boolean":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`form-${field.name}`}
              checked={value || false}
              onCheckedChange={(checked) =>
                handleFieldChange(field.name, checked)
              }
            />
            <label htmlFor={`form-${field.name}`} className="text-sm">
              {field.title}
            </label>
          </div>
        );

      case "Enum":
        return (
          <Select
            value={value || undefined}
            onValueChange={(val) => handleFieldChange(field.name, val)}
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
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) =>
                  handleFieldChange(field.name, date?.toISOString())
                }
              />
            </PopoverContent>
          </Popover>
        );

      case "DateSec":
      case "DateTimeSec":
        const dateValue = value ? new Date(value * 1000) : undefined;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(dateValue!, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(date) =>
                  handleFieldChange(
                    field.name,
                    date ? Math.floor(date.getTime() / 1000) : null
                  )
                }
              />
            </PopoverContent>
          </Popover>
        );

      case "Image":
        return (
          <div className="space-y-2">
            <Input
              type="file"
              accept={field.allowedTypes?.join(",") || "image/*"}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // In a real implementation, you would upload the file here
                  // For now, just store the file name
                  handleFieldChange(field.name, file.name);
                }
              }}
            />
            {value && (
              <img
                src={value}
                alt={field.title}
                className="max-w-xs max-h-32 rounded border"
              />
            )}
          </div>
        );

      case "RichText":
        return (
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={value || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={5}
          />
        );

      default:
        return (
          <Input
            value={value || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  const isNewRecord = !data || !data[idField];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isNewRecord ? "Create New Record" : "Edit Record"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {editableFields.map((field) => {
            const isModified = modifiedFields.has(field.name);
            return (
              <div key={field.name} className="space-y-2">
                {field.type !== "Boolean" && (
                  <Label htmlFor={`form-${field.name}`}>
                    {isModified && <span className="text-orange-500">* </span>}
                    {field.title}
                  </Label>
                )}
                {renderFieldInput(field)}
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          {!isNewRecord && modifiedFields.size > 0 && (
            <Button variant="outline" onClick={handleRollback}>
              Rollback Changes
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isNewRecord
              ? "Create"
              : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

