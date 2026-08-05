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

/**
 * The stat row from shadcn's dashboard-01, fed real figures.
 *
 * As shipped this block hardcoded "$1,250.00", "+12.5%" and "Visitors for the last 6
 * months". Left alone it is a demo: a confident dashboard of numbers that never
 * change. Every value here now comes from the bookings in the database, and the trend
 * badge only renders when there is a genuine prior period to compare against — an
 * invented "+12.5%" is worse than no badge at all.
 */
export function SectionCards({ cards }) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <Card className="@container/card" key={card.label}>
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="font-mono text-2xl font-medium tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
            {card.delta && (
              <CardAction>
                <Badge variant="outline">
                  {card.delta.direction === "up" ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  {card.delta.label}
                </Badge>
              </CardAction>
            )}
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            {card.headline && (
              <div className="line-clamp-1 flex gap-2 font-medium">{card.headline}</div>
            )}
            <div className="text-muted-foreground">{card.detail}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
