"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/**
 * shadcn's interactive area chart, plotting real bookings.
 *
 * As shipped it carried 90 days of invented desktop/mobile visitor counts. It now
 * takes `data` of `{ date, revenue, margin }` built from the bookings table.
 *
 * Two deliberate departures from the block:
 *
 * 1. **Cumulative, not daily.** Eleven bookings across six weeks plotted per-day is
 *    mostly zeroes with a few spikes — technically honest, visually useless. Running
 *    totals show the shape of the business, and the tooltip still reports the day.
 * 2. **Margin is drawn over revenue on the same axis**, both in rupees, so the gap
 *    between the two lines *is* the profit. A second y-axis would let the two be
 *    scaled independently and make a thin margin look healthy, which is the single
 *    most common way a chart lies.
 */

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  margin: { label: "Margin", color: "var(--chart-3)" }
};

// "All" exists and is the default because the presets are relative to the newest
// booking, and travel dates here span roughly five months — a 90-day window drops
// most of the business and the chart renders as a single point, which reads as broken
// rather than as "you picked a narrow window".
const RANGES = {
  all: { label: "All time", short: "All", days: Number.POSITIVE_INFINITY },
  "90d": { label: "Last 3 months", short: "3 months", days: 90 },
  "30d": { label: "Last 30 days", short: "30 days", days: 30 }
};

function inr(value) {
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (Math.abs(value) >= 1000) return `₹${Math.round(value / 1000)}k`;
  return `₹${value}`;
}

export function ChartAreaInteractive({ data = [] }) {
  const isMobile = useIsMobile();
  // Derived rather than set in an effect. The block shipped with a useEffect that
  // called setRange on mobile, which the React compiler flags as a cascading render —
  // and it also silently overrode a user's choice on every viewport change. `null`
  // means "not chosen yet", so the default follows the viewport until someone picks.
  const [chosenRange, setChosenRange] = React.useState(null);
  const range = chosenRange ?? (isMobile ? "90d" : "all");
  const setRange = setChosenRange;

  const filtered = React.useMemo(() => {
    if (data.length === 0) return [];
    // Anchor the window to the newest booking rather than today: with a dataset that
    // stops six weeks ago, "last 30 days" from today is empty and the chart would
    // look broken when the data is simply historical.
    if (!Number.isFinite(RANGES[range].days)) {
      return data;
    }
    const latest = new Date(data[data.length - 1].date);
    const cutoff = new Date(latest);
    cutoff.setDate(cutoff.getDate() - RANGES[range].days);
    return data.filter((point) => new Date(point.date) >= cutoff);
  }, [data, range]);

  const total = filtered.length > 0 ? filtered[filtered.length - 1] : { revenue: 0, margin: 0 };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Revenue and margin</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Running totals by travel date · {inr(total.revenue)} revenue,{" "}
            {inr(total.margin)} margin
          </span>
          <span className="@[540px]/card:hidden">{inr(total.revenue)} revenue</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(value) => value && setRange(value)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            {Object.entries(RANGES).map(([key, meta]) => (
              <ToggleGroupItem key={key} value={key}>
                {meta.short}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a time range"
            >
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {Object.entries(RANGES).map(([key, meta]) => (
                <SelectItem key={key} value={key} className="rounded-lg">
                  {meta.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <div className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No bookings in this range.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={filtered}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillMargin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-margin)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-margin)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric"
                  })
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={52}
                tickFormatter={inr}
              />
              <ChartTooltip
                cursor={false}
                defaultIndex={isMobile ? -1 : undefined}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    }
                    formatter={(value, name) => [
                      ` ${new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0
                      }).format(value)}`,
                      chartConfig[name]?.label ?? name
                    ]}
                    indicator="dot"
                  />
                }
              />
              {/* Revenue sits behind margin, both on one axis, so the space between
                  them reads directly as what the business keeps. */}
              <Area
                dataKey="revenue"
                type="monotone"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
                strokeWidth={2}
              />
              <Area
                dataKey="margin"
                type="monotone"
                fill="url(#fillMargin)"
                stroke="var(--color-margin)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </Card>
  );
}
