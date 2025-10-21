/**
 * Query Builder Utility
 * 
 * Handles conversion between DynamicQuery objects and Spring-compatible URL query strings
 * Format matches Spring Dynamic Query argument resolver exactly:
 * - Criteria: key0=fieldName&operation0=CONTAIN&values0=searchValue
 * - Multiple values: values0=val1&&val2 (joined with &&)
 * - Pagination: page=0&pageSize=20
 * - Sorting: orderBy0=id&orderByDirection0=desc
 */

import { Criteria, CriteriaOperation, DynamicQuery } from "../types/field.types";

const KEY_FIELD = "key";
const OPERATION_FIELD = "operation";
const VALUES_FIELD = "values";

export class QueryBuilder {
  private _dynamicQuery: DynamicQuery;

  constructor(initialQuery?: DynamicQuery) {
    this._dynamicQuery = initialQuery || {
      criteria: [],
      page: 0,
      pageSize: 20,
    };
  }

  /**
   * Get the current dynamic query object
   */
  get query(): DynamicQuery {
    return this._dynamicQuery;
  }

  /**
   * Set the entire dynamic query object
   */
  set query(query: DynamicQuery) {
    this._dynamicQuery = query;
  }

  /**
   * Convert DynamicQuery to Spring-compatible URL query string
   * 
   * Example output:
   * key0=name&operation0=CONTAIN&values0=test&page=0&pageSize=20&orderBy0=id&orderByDirection0=desc
   */
  toQueryString(): string {
    const params = new URLSearchParams();

    // Add criteria
    this._dynamicQuery.criteria.forEach((criteria, idx) => {
      params.append(`${KEY_FIELD}${idx}`, criteria.key);
      params.append(`${OPERATION_FIELD}${idx}`, criteria.operation);
      criteria.values.forEach((value) => {
        params.append(`${VALUES_FIELD}${idx}`, value);
      });
    });

    // Add select fields
    if (this._dynamicQuery.select && this._dynamicQuery.select.length > 0) {
      this._dynamicQuery.select.forEach((field, idx) => {
        params.append(`select${idx}`, field);
      });
    }

    // Add selectAs (aliases)
    if (this._dynamicQuery.selectAs && this._dynamicQuery.selectAs.length > 0) {
      this._dynamicQuery.selectAs.forEach((alias, idx) => {
        params.append(`selectAs${idx}`, alias);
      });
    }

    // Add orderBy
    if (this._dynamicQuery.orderBy && this._dynamicQuery.orderBy.length > 0) {
      this._dynamicQuery.orderBy.forEach((field, idx) => {
        params.append(`orderBy${idx}`, field);
      });
    }

    // Add orderByDirection
    if (
      this._dynamicQuery.orderByDirection &&
      this._dynamicQuery.orderByDirection.length > 0
    ) {
      this._dynamicQuery.orderByDirection.forEach((direction, idx) => {
        params.append(`orderByDirection${idx}`, direction);
      });
    }

    // Add pagination
    if (this._dynamicQuery.page !== undefined) {
      params.append("page", this._dynamicQuery.page.toString());
    }

    if (this._dynamicQuery.pageSize !== undefined) {
      params.append("pageSize", this._dynamicQuery.pageSize.toString());
    }

    return params.toString();
  }

  /**
   * Parse Spring-compatible URL query string to DynamicQuery
   * 
   * Example input:
   * key0=name&operation0=CONTAIN&values0=test&page=0&pageSize=20&orderBy0=id&orderByDirection0=desc
   */
  fromQueryString(queryString: string): DynamicQuery {
    const params = new URLSearchParams(queryString);
    const criteria: Criteria[] = [];
    const select: string[] = [];
    const selectAs: string[] = [];
    const orderBy: string[] = [];
    const orderByDirection: ("asc" | "desc")[] = [];

    // Parse criteria
    const criteriaMap = new Map<number, Partial<Criteria>>();

    params.forEach((value, key) => {
      // Match key0, operation0, values0, etc.
      const keyMatch = key.match(/^key(\d+)$/);
      const operationMatch = key.match(/^operation(\d+)$/);
      const valuesMatch = key.match(/^values(\d+)$/);

      if (keyMatch) {
        const idx = parseInt(keyMatch[1], 10);
        if (!criteriaMap.has(idx)) {
          criteriaMap.set(idx, {});
        }
        criteriaMap.get(idx)!.key = value;
      } else if (operationMatch) {
        const idx = parseInt(operationMatch[1], 10);
        if (!criteriaMap.has(idx)) {
          criteriaMap.set(idx, {});
        }
        criteriaMap.get(idx)!.operation = value as CriteriaOperation;
      } else if (valuesMatch) {
        const idx = parseInt(valuesMatch[1], 10);
        if (!criteriaMap.has(idx)) {
          criteriaMap.set(idx, { values: [] });
        }
        if (!criteriaMap.get(idx)!.values) {
          criteriaMap.get(idx)!.values = [];
        }
        // Handle multiple values joined with &&
        const splitValues = decodeURIComponent(value).split("&&");
        criteriaMap.get(idx)!.values!.push(...splitValues);
      }

      // Parse select
      const selectMatch = key.match(/^select(\d+)$/);
      if (selectMatch) {
        const idx = parseInt(selectMatch[1], 10);
        select[idx] = value;
      }

      // Parse selectAs
      const selectAsMatch = key.match(/^selectAs(\d+)$/);
      if (selectAsMatch) {
        const idx = parseInt(selectAsMatch[1], 10);
        selectAs[idx] = value;
      }

      // Parse orderBy
      const orderByMatch = key.match(/^orderBy(\d+)$/);
      if (orderByMatch) {
        const idx = parseInt(orderByMatch[1], 10);
        orderBy[idx] = value;
      }

      // Parse orderByDirection
      const orderByDirectionMatch = key.match(/^orderByDirection(\d+)$/);
      if (orderByDirectionMatch) {
        const idx = parseInt(orderByDirectionMatch[1], 10);
        orderByDirection[idx] = value as "asc" | "desc";
      }
    });

    // Convert criteriaMap to array
    criteriaMap.forEach((criteriaObj) => {
      if (criteriaObj.key && criteriaObj.operation && criteriaObj.values) {
        criteria.push({
          key: criteriaObj.key,
          operation: criteriaObj.operation,
          values: criteriaObj.values,
        });
      }
    });

    this._dynamicQuery = {
      criteria,
      select: select.length > 0 ? select : undefined,
      selectAs: selectAs.length > 0 ? selectAs : undefined,
      orderBy: orderBy.length > 0 ? orderBy : undefined,
      orderByDirection:
        orderByDirection.length > 0 ? orderByDirection : undefined,
      page: params.has("page") ? parseInt(params.get("page")!, 10) : undefined,
      pageSize: params.has("pageSize")
        ? parseInt(params.get("pageSize")!, 10)
        : undefined,
    };

    return this._dynamicQuery;
  }

  /**
   * Add a criteria to the query
   */
  addCriteria(key: string, operation: CriteriaOperation, values: string[]): void {
    this._dynamicQuery.criteria.push({
      key,
      operation,
      values,
    });
  }

  /**
   * Remove criteria by key and optionally by operation
   */
  removeCriteria(key: string, operation?: CriteriaOperation): void {
    this._dynamicQuery.criteria = this._dynamicQuery.criteria.filter(
      (c) => c.key !== key || (operation && c.operation !== operation)
    );
  }

  /**
   * Remove all criteria for a specific key
   */
  removeCriteriaByKey(key: string): void {
    this._dynamicQuery.criteria = this._dynamicQuery.criteria.filter(
      (c) => c.key !== key
    );
  }

  /**
   * Update or add criteria
   */
  upsertCriteria(
    key: string,
    operation: CriteriaOperation,
    values: string[]
  ): void {
    this.removeCriteria(key, operation);
    this.addCriteria(key, operation, values);
  }

  /**
   * Set page number
   */
  setPage(page: number): void {
    this._dynamicQuery.page = page;
  }

  /**
   * Set page size
   */
  setPageSize(pageSize: number): void {
    this._dynamicQuery.pageSize = pageSize;
  }

  /**
   * Set sorting
   */
  setSort(field: string, direction: "asc" | "desc"): void {
    this._dynamicQuery.orderBy = [field];
    this._dynamicQuery.orderByDirection = [direction];
  }

  /**
   * Clear all sorting
   */
  clearSort(): void {
    this._dynamicQuery.orderBy = undefined;
    this._dynamicQuery.orderByDirection = undefined;
  }

  /**
   * Clear all criteria
   */
  clearCriteria(): void {
    this._dynamicQuery.criteria = [];
  }

  /**
   * Clear everything
   */
  clear(): void {
    this._dynamicQuery = {
      criteria: [],
      page: 0,
      pageSize: 20,
    };
  }

  /**
   * Get criteria values for a specific key
   */
  getCriteriaValues(key: string, operation?: CriteriaOperation): string[] {
    const criteria = this._dynamicQuery.criteria.filter(
      (c) => c.key === key && (!operation || c.operation === operation)
    );
    return criteria.flatMap((c) => c.values);
  }

  /**
   * Check if a criteria exists
   */
  hasCriteria(key: string, operation?: CriteriaOperation): boolean {
    return this._dynamicQuery.criteria.some(
      (c) => c.key === key && (!operation || c.operation === operation)
    );
  }
}

/**
 * Create a new QueryBuilder instance
 */
export function createQueryBuilder(initialQuery?: DynamicQuery): QueryBuilder {
  return new QueryBuilder(initialQuery);
}

/**
 * Parse query string from URL
 */
export function parseQueryString(queryString: string): DynamicQuery {
  const builder = new QueryBuilder();
  return builder.fromQueryString(queryString);
}

/**
 * Convert DynamicQuery to query string
 */
export function toQueryString(query: DynamicQuery): string {
  const builder = new QueryBuilder(query);
  return builder.toQueryString();
}

