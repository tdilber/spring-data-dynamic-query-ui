"use client";

import React from "react";
import { Field } from "@/lib/types/field.types";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DetailViewProps {
  data: any;
  fields: Field[];
  open: boolean;
  onClose: () => void;
}

export function DetailView({ data, fields, open, onClose }: DetailViewProps) {
  const detailFields = fields.filter((f) => f.showInDetail);

  const getFieldValue = (field: Field, data: any): any => {
    const path = (field.accessor || field.name).split(".");
    let value = data;
    for (const key of path) {
      if (value && typeof value === "object") {
        value = value[key];
      } else {
        return null;
      }
    }
    return value;
  };

  const renderFieldValue = (field: Field, value: any) => {
    // Use custom renderer if provided
    if (field.renderCell) {
      return field.renderCell(value, data);
    }

    // Handle null/undefined
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">--</span>;
    }

    switch (field.type) {
      case "Boolean":
        return <span>{value ? "Yes" : "No"}</span>;

      case "Enum":
        return <span>{field.enumValues[value] || value}</span>;

      case "DateSec":
      case "DateTimeSec":
        try {
          const date = new Date(value * 1000);
          return <span>{format(date, "PPpp")}</span>;
        } catch {
          return <span>{value}</span>;
        }

      case "Date":
        try {
          const date = typeof value === "string" ? new Date(value) : value;
          return <span>{format(date, "PPpp")}</span>;
        } catch {
          return <span>{value}</span>;
        }

      case "Image":
        return (
          <div>
            <img
              src={value}
              alt={field.title}
              className="max-w-xs max-h-48 rounded border cursor-pointer hover:opacity-80"
              onClick={() => window.open(value, "_blank")}
            />
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline block mt-1"
            >
              {value}
            </a>
          </div>
        );

      case "RichText":
        return (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        );

      default:
        return <span>{value.toString()}</span>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {detailFields.map((field) => {
            const value = getFieldValue(field, data);
            return (
              <div key={field.name} className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  {field.title}
                </div>
                <div className="p-3 bg-muted/50 rounded-md">
                  {renderFieldValue(field, value)}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

