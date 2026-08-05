"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * The bookings table, in the shape of dashboard-01's data table.
 *
 * Written against the same shadcn primitives rather than adapting the shipped
 * component: that one is 26KB built around a demo schema
 * (`header / type / status / target / limit / reviewer`) and four drag-reorderable
 * tabs. Bookings have no manual order, so the dnd-kit machinery would be four
 * dependencies of dead weight, and every column would have needed renaming anyway.
 *
 * What is kept is what makes it useful: the tab filter, sortable columns, a column
 * toggle and pagination. The tabs filter by booking type, which is a real cut of this
 * data rather than four invented section names.
 */

function inr(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value ?? 0));
}

const TABS = [
  { value: "all", label: "All bookings" },
  { value: "flight", label: "Flights" },
  { value: "hotel", label: "Hotels" },
  { value: "package", label: "Packages" }
];

function SortableHeader({ column, children, numeric }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`-ml-3 h-8 ${numeric ? "ml-auto" : ""}`}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {children}
      <ChevronsUpDownIcon className="ml-1 size-3.5 opacity-50" />
    </Button>
  );
}

export function BookingsTable({ rows }) {
  const [sorting, setSorting] = React.useState([{ id: "travelDate", desc: true }]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [tab, setTab] = React.useState("all");

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "bookingCode",
        header: "Booking",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.bookingCode}</span>
        )
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-2 capitalize">
            <span
              className="inline-block size-2 shrink-0 rounded-xs"
              style={{ backgroundColor: row.original.color }}
            />
            {row.original.type}
          </span>
        )
      },
      // Capped and truncated, with the full value on hover. Left to size themselves
      // these two columns ran to ~50 characters and pushed Price, Margin and Take off
      // the right edge of the card — the three columns the table exists for were the
      // ones you had to scroll to find.
      {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <div className="max-w-44 truncate" title={row.original.customer}>
            {row.original.customer}
          </div>
        )
      },
      {
        accessorKey: "route",
        header: "Route / Stay",
        cell: ({ row }) => (
          <div className="max-w-56 truncate" title={row.original.route}>
            {row.original.route}
          </div>
        )
      },
      {
        accessorKey: "travelDate",
        header: ({ column }) => <SortableHeader column={column}>Travel date</SortableHeader>,
        cell: ({ row }) => (
          <span className="font-mono text-xs tabular-nums">
            {row.original.travelDate || "—"}
          </span>
        )
      },
      {
        accessorKey: "gross",
        header: ({ column }) => (
          <div className="text-right">
            <SortableHeader column={column} numeric>
              Price
            </SortableHeader>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-mono tabular-nums">{inr(row.original.gross)}</div>
        )
      },
      {
        accessorKey: "margin",
        header: ({ column }) => (
          <div className="text-right">
            <SortableHeader column={column} numeric>
              Margin
            </SortableHeader>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-mono tabular-nums">{inr(row.original.margin)}</div>
        )
      },
      {
        accessorKey: "takePct",
        header: ({ column }) => (
          <div className="text-right">
            <SortableHeader column={column} numeric>
              Take
            </SortableHeader>
          </div>
        ),
        cell: ({ row }) => {
          const take = row.original.takePct;
          return (
            <div className="text-right">
              {take === 0 ? (
                <Badge variant="outline" className="text-destructive">
                  0%
                </Badge>
              ) : (
                <span className="font-mono tabular-nums">
                  {take === null ? "—" : `${take.toFixed(2)}%`}
                </span>
              )}
            </div>
          );
        }
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.status}
          </Badge>
        )
      }
    ],
    []
  );

  const filtered = React.useMemo(
    () => (tab === "all" ? rows : rows.filter((row) => row.type === tab)),
    [rows, tab]
  );

  // TanStack Table returns functions the React Compiler cannot memoize, so it skips
  // optimising this component. That is the documented trade-off of using the library at
  // all; nothing here passes memoized values onward, and the table is a few hundred rows
  // at most.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

  return (
    // One raised surface, like every other block on the page. This used to sit
    // directly on the page background inside its own `px-4 lg:px-6`, which both
    // double-padded it against the page's own gutter and left it as the only
    // unelevated thing on the screen.
    <div className="w-full rounded-lg bg-paper p-4 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Scrolls rather than overflows. Four triggers plus their count badges
            are ~420px wide, which is more than a phone has after card padding. */}
        <div className="-mx-1 max-w-full overflow-x-auto px-1">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
            {TABS.map((entry) => {
              const count =
                entry.value === "all"
                  ? rows.length
                  : rows.filter((row) => row.type === entry.value).length;
              return (
                <TabsTrigger key={entry.value} value={entry.value}>
                  {entry.label}
                  <Badge variant="secondary" className="ml-2">
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
            </TabsList>
          </Tabs>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Columns
              <ChevronDownIcon className="ml-1 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id.replace(/([A-Z])/g, " $1").toLowerCase()}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-5 overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/70 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No bookings in this view.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {filtered.length} booking{filtered.length === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="size-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
