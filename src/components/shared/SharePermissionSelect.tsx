import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SharePermission } from "@/features/notes/dtos/note-share.dto";

interface SharePermissionSelectProps {
  value: SharePermission;
  onChange: (value: SharePermission) => void;
  disabled?: boolean;
}

const PERMISSIONS = [
  { value: "read" as const, label: "Can view" },
  { value: "write" as const, label: "Can edit" },
  { value: "owner" as const, label: "Full access" },
];

export function SharePermissionSelect({
  value,
  onChange,
  disabled,
}: SharePermissionSelectProps) {
  const selected = PERMISSIONS.find((p) => p.value === value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-8 justify-between"
        >
          {selected?.label}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-0" align="end">
        <Command>
          <CommandList>
            <CommandGroup>
              {PERMISSIONS.map((permission) => (
                <CommandItem
                  key={permission.value}
                  value={permission.value}
                  onSelect={() => onChange(permission.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === permission.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {permission.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
