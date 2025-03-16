import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { Checkbox } from "@/components/ui/checkbox";
  import { Button } from "@/components/ui/button";
  import { useState } from "react";
  
  interface FilterDropdownProps {
    label: string; // 選單名字
    items: string[]; // 選項
    selectedItems: string[]; // 已選中的項目
    onSelectionChange: (item: string) => void; // 處理選項變化的回調
  }
  
  function FilterDropdown({
    label,
    items,
    selectedItems,
    onSelectionChange,
  }: FilterDropdownProps) {
    const [menuOpen, setMenuOpen] = useState(false); // 控制選單開啟/關閉
  
    return (
      <div className="m-2">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="text-white cursor-pointer visited: none">
              {selectedItems.length > 0
                ? `${label} (${selectedItems.length})`
                : `${label}`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {items.map((item) => (
              <DropdownMenuCheckboxItem
                key={item}
                checked={selectedItems.includes(item)}
                onCheckedChange={() => onSelectionChange(item)}
                className="flex items-center space-x-2 p-2"
                onSelect={(e) => e.preventDefault()} // 阻止點擊關閉
              >
                <Checkbox checked={selectedItems.includes(item)} className="mr-2" />
                <span>{item}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  
  export default FilterDropdown;