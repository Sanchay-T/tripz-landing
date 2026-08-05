import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/cn";

/**
 * The supporting stat row.
 *
 * Two things changed about what this shows. As shipped by shadcn it hardcoded
 * "$1,250.00" and "+12.5%" — a confident dashboard of numbers that never move — so
 * every value here now comes from the bookings in the database, and a trend badge
 * renders only when there is a genuine prior period to compare against.
 *
 * Then it stopped repeating the hero. Revenue, margin and take rate live in the chart
 * card above; carrying them again here would spend the widest row on the page saying
 * the same thing twice. These four are the figures that are *not* visible anywhere
 * else on first sight: how many bookings, how much of the revenue earns nothing, what
 * went out, and what is actually left.
 */
export function SectionCards({ cards }) {
  return (
    <div className="grid grid-cols-1 gap-5 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <Card className="@container/card" key={card.label}>
          <CardHeader>
            <CardDescription className="font-mono text-xs uppercase tracking-widest text-ink/45">
              {card.label}
            </CardDescription>
            <CardTitle
              className={cn(
                "font-mono text-2xl sm:text-3xl font-medium leading-none tracking-tight tabular-nums",
                card.tone === "critical" && "text-critical",
                card.tone === "accent" && "text-brand-vivid",
                !card.tone && "text-ink"
              )}
            >
              {card.value}
            </CardTitle>
            {card.delta && (
              <CardAction>
                <Badge variant="outline" className="gap-1 font-mono text-xs">
                  {card.delta.direction === "up" ? (
                    <TrendingUpIcon className="size-3" />
                  ) : (
                    <TrendingDownIcon className="size-3" />
                  )}
                  {card.delta.label}
                </Badge>
              </CardAction>
            )}
          </CardHeader>
          <CardFooter>
            <p className="text-xs leading-normal text-ink/50">
              {card.detail}
              {card.delta?.caption && (
                <span className="text-ink/35"> · {card.delta.caption}</span>
              )}
            </p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
