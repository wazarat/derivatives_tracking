declare module '@tanstack/react-table' {
  export type ColumnDef<T> = {
    accessorKey?: string;
    header?: string | ((props: any) => React.ReactNode);
    cell?: (props: { row: { getValue: (key: string) => any; original: T; id: string } }) => React.ReactNode;
    enableSorting?: boolean;
    enableHiding?: boolean;
    size?: number;
    minSize?: number;
    maxSize?: number;
  };

  export type SortingState = {
    id: string;
    desc: boolean;
  }[];

  export type VisibilityState = {
    [key: string]: boolean;
  };

  export type ColumnFiltersState = {
    id: string;
    value: any;
  }[];

  export type TableState = {
    sorting: SortingState;
    columnVisibility: VisibilityState;
    columnFilters: ColumnFiltersState;
    pagination: {
      pageIndex: number;
      pageSize: number;
    };
  };

  export type Table<T> = {
    getState: () => TableState;
    getRowModel: () => { rows: { original: T; getVisibleCells: () => any[]; id: string }[] };
    getHeaderGroups: () => any[];
    getFooterGroups: () => any[];
    getAllColumns: () => any[];
    getVisibleLeafColumns: () => any[];
    setPageIndex: (index: number) => void;
    getPageCount: () => number;
    getCanPreviousPage: () => boolean;
    getCanNextPage: () => boolean;
    previousPage: () => void;
    nextPage: () => void;
    setPageSize: (size: number) => void;
    setColumnVisibility: (state: VisibilityState) => void;
    resetColumnVisibility: () => void;
    setSorting: (state: SortingState) => void;
    resetSorting: () => void;
    setColumnFilters: (state: ColumnFiltersState) => void;
    resetColumnFilters: () => void;
    getFilteredRowModel: () => any;
    getPaginationRowModel: () => any;
    getSortedRowModel: () => any;
    getCoreRowModel: () => any;
    getSortedRowModel: () => any;
    getFilteredRowModel: () => any;
    getPaginationRowModel: () => any;
  };

  export function useReactTable<T>(options: {
    data: T[];
    columns: ColumnDef<T>[];
    state?: Partial<TableState>;
    onSortingChange?: (sorting: SortingState) => void;
    onColumnVisibilityChange?: (visibility: VisibilityState) => void;
    onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
    getCoreRowModel?: () => any;
    getSortedRowModel?: () => any;
    getFilteredRowModel?: () => any;
    getPaginationRowModel?: () => any;
    manualPagination?: boolean;
    pageCount?: number;
  }): Table<T>;

  export function flexRender(component: any, props: any): React.ReactNode;
  
  // Add missing utility functions
  export function getCoreRowModel(): any;
  export function getSortedRowModel(): any;
  export function getFilteredRowModel(): any;
  export function getPaginationRowModel(): any;
}
