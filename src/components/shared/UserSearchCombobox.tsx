import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useUserSearchQuery } from "@/features/users/hooks/useUserSearchQuery";
import type { User } from "@/features/users/models/user.model";

interface UserSearchComboboxProps {
  value?: string;
  onChange: (user: User | null) => void;
  excludeUserIds?: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function UserSearchCombobox({
  value,
  onChange,
  excludeUserIds = [],
  placeholder = "Search users...",
  disabled,
}: Readonly<UserSearchComboboxProps>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useUserSearchQuery(searchQuery);

  const filteredUsers =
    data?.items.filter((user) => !excludeUserIds.includes(user.id)) ?? [];

  const selectedUser = filteredUsers.find((user) => user.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="justify-between"
        >
          {selectedUser ? (
            <span className="truncate">
              {selectedUser.displayName || selectedUser.username}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name or email..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <Search className="mx-auto h-4 w-4 animate-pulse" />
              </div>
            )}
            {!isLoading && filteredUsers.length === 0 && (
              <CommandEmpty>
                {searchQuery.length < 2
                  ? "Type to search users"
                  : "No users found"}
              </CommandEmpty>
            )}
            {filteredUsers.length > 0 && (
              <CommandGroup>
                {filteredUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => {
                      onChange(user.id === value ? null : user);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate font-medium">
                        {user.displayName || user.username}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
