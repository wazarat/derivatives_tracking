"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { getMetricInfo } from "@/config/metrics";
import { Instrument } from "@/config/columns";
import { fetchSectorInstruments } from "@/services/assetService";

interface SectorDashboardProps<TData extends Instrument> {
  sector: string;
  title: string;
  description: string;
  columns: ColumnDef<TData>[];
}

export function SectorDashboard<TData extends Instrument>({
  sector,
  title,
  description,
  columns,
}: SectorDashboardProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch data from API
  const { data: instruments = [], isLoading, error } = useQuery({
    queryKey: ["sectorInstruments", sector],
    queryFn: () => fetchSectorInstruments(sector),
  });

  // Filter data based on search query
  const filteredData = useMemo(() => {
    return instruments.filter((instrument: any) => {
      const searchStr = searchQuery.toLowerCase();
      return (
        instrument.symbol?.toLowerCase().includes(searchStr) ||
        instrument.name?.toLowerCase().includes(searchStr) ||
        instrument.venue?.toLowerCase().includes(searchStr)
      );
    });
  }, [instruments, searchQuery]);

  // Set up table
  const table = useReactTable({
    data: filteredData as TData[],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Function to add to watchlist
  const addToWatchlist = (instrument: TData) => {
    // TODO: Implement watchlist functionality
    console.log("Add to watchlist:", instrument);
  };

  // Function to add to portfolio
  const addToPortfolio = (instrument: TData) => {
    // TODO: Implement portfolio functionality
    console.log("Add to portfolio:", instrument);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search instruments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <InfoCircledIcon className="h-4 w-4 mr-1" /> Metrics Info
                </Button>
              </TooltipTrigger>
              <TooltipContent className="w-80">
                <div className="space-y-2">
                  <h3 className="font-medium">Metrics Information</h3>
                  <ul className="text-sm space-y-1">
                    {columns.map((column) => {
                      const key = column.accessorKey as string;
                      const metricInfo = getMetricInfo(key);
                      if (metricInfo) {
                        return (
                          <li key={key}>
                            <span className="font-medium">{metricInfo.name}:</span>{" "}
                            {metricInfo.description}
                          </li>
                        );
                      }
                      return null;
                    })}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading instruments...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">Error loading data</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "flex items-center gap-1 cursor-pointer select-none"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " ↑",
                            desc: " ↓",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Add to...
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => addToWatchlist(row.original)}>
                            Add to Watchlist
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addToPortfolio(row.original)}>
                            Add to Portfolio
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
