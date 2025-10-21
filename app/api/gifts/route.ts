import { NextRequest, NextResponse } from "next/server";
import { SpringPage } from "@/lib/types/field.types";

// Mock data
const mockData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  discountCode: `GIFT${String(i + 1).padStart(3, "0")}`,
  showName: `Gift Card ${i + 1}`,
  reason: i % 3 === 0 ? "Bulk Creation" : i % 3 === 1 ? "Manual" : "Import",
  imageUrl: `https://picsum.photos/200?random=${i}`,
  description: `<p>This is a sample gift card description for <strong>Gift Card ${i + 1}</strong></p>`,
  codeType: ["NORMAL", "SECOND_ITEM_PERCENTAGE", "ADD_X_ITEM_PERCENTAGE"][i % 3],
  minimumBasketItemCount: i % 2 === 0 ? 2 : 5,
  beginDate: Math.floor(Date.now() / 1000) - (i * 86400),
  endDate: Math.floor(Date.now() / 1000) + ((100 - i) * 86400),
  type: i % 2 === 0 ? "1" : "2",
  showLocation: ["NONE", "PRODUCT_DETAIL", "BASKET", "BASKET_AND_PRODUCT_DETAIL"][i % 4],
  showCountry: ["TURKEY", "UNITED_KINGDOM", "NON_TURKEY", "ALL"][i % 4],
  active: i % 3 !== 0,
  createDate: Math.floor(Date.now() / 1000) - (i * 172800),
}));

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Parse pagination
  const page = parseInt(searchParams.get("page") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

  // Parse criteria for filtering
  let filteredData = [...mockData];

  // Simple filtering logic (you can make this more sophisticated)
  const criteriaKeys = Array.from(searchParams.keys()).filter((key) =>
    key.startsWith("key")
  );

  criteriaKeys.forEach((keyParam) => {
    const index = keyParam.replace("key", "");
    const key = searchParams.get(keyParam);
    const operation = searchParams.get(`operation${index}`);
    const values = searchParams.getAll(`values${index}`);

    if (!key || !operation || values.length === 0) return;

    filteredData = filteredData.filter((item: any) => {
      const itemValue = item[key];

      switch (operation) {
        case "CONTAIN":
          return itemValue
            ?.toString()
            .toLowerCase()
            .includes(values[0].toLowerCase());
        case "EQUAL":
          return values.some((v) => itemValue?.toString() === v);
        case "GREATER_THAN":
          return itemValue > parseFloat(values[0]);
        case "GREATER_THAN_OR_EQUAL":
          return itemValue >= parseFloat(values[0]);
        case "LESS_THAN":
          return itemValue < parseFloat(values[0]);
        case "LESS_THAN_OR_EQUAL":
          return itemValue <= parseFloat(values[0]);
        case "SPECIFIED":
          return itemValue !== null && itemValue !== undefined;
        default:
          return true;
      }
    });
  });

  // Parse sorting
  const orderBy = searchParams.get("orderBy0");
  const orderByDirection = searchParams.get("orderByDirection0") || "desc";

  if (orderBy) {
    filteredData.sort((a: any, b: any) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return orderByDirection === "asc" ? comparison : -comparison;
    });
  }

  // Apply pagination
  const start = page * pageSize;
  const end = start + pageSize;
  const paginatedData = filteredData.slice(start, end);

  // Build Spring Page response
  const response: SpringPage<any> = {
    content: paginatedData,
    pageable: {
      pageNumber: page,
      pageSize: pageSize,
      sort: {
        sorted: !!orderBy,
        unsorted: !orderBy,
        empty: !orderBy,
      },
      offset: start,
      paged: true,
      unpaged: false,
    },
    totalPages: Math.ceil(filteredData.length / pageSize),
    totalElements: filteredData.length,
    last: end >= filteredData.length,
    size: pageSize,
    number: page,
    sort: {
      sorted: !!orderBy,
      unsorted: !orderBy,
      empty: !orderBy,
    },
    numberOfElements: paginatedData.length,
    first: page === 0,
    empty: paginatedData.length === 0,
  };

  return NextResponse.json(response);
}

