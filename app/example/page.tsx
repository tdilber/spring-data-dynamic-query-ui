"use client";

import React from "react";
import { DynamicQueryTable } from "@/components/dynamic-query-table";
import { Field } from "@/lib/types/field.types";

export default function ExamplePage() {
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
      name: "discountCode",
      title: "Discount Code",
      type: "String",
      visible: true,
      filterable: true,
      sortable: true,
      showInDetail: true,
      editable: true,
      placeholder: "Enter discount code...",
    },
    {
      name: "showName",
      title: "Display Name",
      type: "String",
      visible: true,
      filterable: true,
      sortable: true,
      showInDetail: true,
      editable: true,
    },
    {
      name: "reason",
      title: "Creation Reason",
      type: "String",
      visible: true,
      filterable: true,
      sortable: true,
      showInDetail: true,
      editable: false,
    },
    {
      name: "imageUrl",
      title: "Cart Image",
      type: "Image",
      visible: true,
      filterable: false,
      sortable: false,
      showInDetail: true,
      editable: true,
      uploadConfig: "gift-card-image",
    },
    {
      name: "description",
      title: "Description",
      type: "RichText",
      visible: false,
      filterable: false,
      sortable: false,
      showInDetail: true,
      editable: true,
    },
    {
      name: "codeType",
      title: "Gift Code Type",
      type: "Enum",
      enumValues: {
        NORMAL: "Normal",
        SECOND_ITEM_PERCENTAGE: "Second Item % Discount",
        ADD_X_ITEM_PERCENTAGE: "X Items % Discount",
      },
      visible: true,
      filterable: true,
      sortable: true,
      showInDetail: true,
      editable: true,
    },
    {
      name: "minimumBasketItemCount",
      title: "Minimum Basket Items",
      type: "Integer",
      visible: true,
      filterable: true,
      sortable: true,
      showInDetail: true,
      editable: true,
    },
    {
      name: "beginDate",
      title: "Start Date",
      type: "DateTimeSec",
      visible: true,
      filterable: true,
      sortable: true,
      showInDetail: true,
      editable: true,
    },
    {
      name: "endDate",
      title: "End Date",
      type: "DateTimeSec",
      visible: true,
      filterable: true,
      sortable: true,
      showInDetail: true,
      editable: true,
    },
    {
      name: "type",
      title: "Discount Type",
      type: "Enum",
      enumValues: {
        "1": "Fixed",
        "2": "Percentage",
      },
      visible: true,
      filterable: true,
      sortable: true,
      showInDetail: true,
      editable: true,
    },
    {
      name: "showLocation",
      title: "Display Location",
      type: "Enum",
      enumValues: {
        NONE: "None",
        PRODUCT_DETAIL: "Product Detail",
        PRODUCT_DETAIL_WITH_TAG: "Product Detail (Tagged)",
        BASKET: "Basket",
        BASKET_AND_PRODUCT_DETAIL: "Basket and Product Detail",
        BASKET_AND_PRODUCT_DETAIL_WITH_TAG: "Basket and Product Detail (Tagged)",
        BASKET_IF_APPLICABLE: "Show in Basket if Applicable",
      },
      visible: true,
      filterable: true,
      sortable: true,
      showInDetail: true,
      editable: true,
    },
    {
      name: "showCountry",
      title: "Display Country",
      type: "Enum",
      enumValues: {
        TURKEY: "Turkey",
        UNITED_KINGDOM: "United Kingdom",
        NON_TURKEY: "Non-Turkey",
        NON_TURKEY_AND_UNITED_KINGDOM: "Non-Turkey and UK",
        ALL: "All Countries",
      },
      visible: true,
      filterable: true,
      sortable: true,
      showInDetail: true,
      editable: true,
    },
    {
      name: "active",
      title: "Active",
      type: "Boolean",
      visible: true,
      filterable: true,
      sortable: true,
      showInDetail: true,
      editable: true,
    },
    {
      name: "createDate",
      title: "Created At",
      type: "DateSec",
      visible: true,
      filterable: true,
      sortable: true,
      showInDetail: true,
      editable: false,
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Spring Dynamic Query Table Example</h1>
        <p className="text-muted-foreground">
          This example demonstrates the DynamicQueryTable component with various field types.
          All query parameters are synced with the URL and match the Spring Dynamic Query format.
        </p>
      </div>

      <DynamicQueryTable
        fields={fields}
        apiUrl="/api/gifts"
        enableFilter={true}
        enableSelection={true}
        enableCreate={true}
        enableEdit={true}
        pageSize={20}
        defaultSortField="id"
        onRowSelect={(rows) => {
          console.log("Selected rows:", rows);
        }}
        onDataChange={(data) => {
          console.log("Data changed:", data);
        }}
      />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="font-semibold mb-2">Features Demonstrated:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>URL-synced filtering, sorting, and pagination</li>
          <li>Spring-compatible query format (key0, operation0, values0)</li>
          <li>Multiple field types (String, Integer, Boolean, Enum, Date, Image, RichText)</li>
          <li>Collapsible filter panel with pin functionality</li>
          <li>Column visibility toggle</li>
          <li>Row selection</li>
          <li>Detail view dialog</li>
          <li>Create/Edit form with validation</li>
          <li>Custom cell and form renderers</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="font-semibold text-amber-900 mb-2">Note:</h3>
        <p className="text-sm text-amber-800">
          This example uses <code className="bg-amber-100 px-1 rounded">/api/gifts</code> as the
          API endpoint. You'll need to create this API route or use a real backend with Spring Dynamic
          Query support to see live data. The component will work with any endpoint that returns data
          in Spring Page format.
        </p>
      </div>
    </div>
  );
}

