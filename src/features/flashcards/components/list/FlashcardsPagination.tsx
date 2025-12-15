import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface FlashcardsPaginationProps {
  page: number;
  maxPage: number;
  setPage: (page: number) => void;
}

export function FlashcardsPagination({ page, maxPage, setPage }: Readonly<FlashcardsPaginationProps>) {
  const [pageInput, setPageInput] = useState(String(page + 1));

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage <= maxPage) {
      setPage(newPage);
      setPageInput(String(newPage + 1));
    }
  };

  const handleInputChange = (value: string) => {
    setPageInput(value);
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= maxPage + 1) {
      setPage(num - 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          max={maxPage + 1}
          value={pageInput}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-16 text-center"
        />
        <span className="text-sm text-muted-foreground">sur {maxPage + 1}</span>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === maxPage}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
