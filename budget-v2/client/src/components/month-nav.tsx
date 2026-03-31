import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthLabel, prevMonth, nextMonth } from "@/lib/utils";

interface MonthNavProps {
  month: string;
  onChange: (m: string) => void;
}

export default function MonthNav({ month, onChange }: MonthNavProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChange(prevMonth(month))} data-testid="month-prev">
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm font-medium capitalize min-w-[140px] text-center" data-testid="month-label">
        {formatMonthLabel(month)}
      </span>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChange(nextMonth(month))} data-testid="month-next">
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
