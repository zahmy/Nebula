'use client';

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

interface FilterDropdownProps {
	label: string; // 選單名字
	items: string[]; // 選項
	selectedItems: string[]; // 已選中的項目
	onSelectionChange: (item: string) => void; // 處理選項變化
	disabled?: boolean; // 選單是否禁用
}

// Objekts下拉選單
export default function DropdownFilter({
	label,
	items,
	selectedItems,
	onSelectionChange,
	disabled = false,
}: FilterDropdownProps) {
	return (
		<div className="m-2">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						disabled={disabled}
						className="cursor-pointer visited: none"
					>
						{selectedItems.length > 0
							? `${label} (${selectedItems.length})`
							: `${label}`}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56 bg-black/50 backdrop-blur-md border border-gray-200/20 shadow-lg rounded-md">
					<DropdownMenuLabel>{label}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{items.map((item) => (
						<DropdownMenuCheckboxItem
							key={item}
							checked={selectedItems.includes(item)}
							onCheckedChange={() => onSelectionChange(item)}
							className="flex items-center space-x-2 p-2"
							onSelect={(e) => e.preventDefault()} // 阻止勾選關閉選單
						>
							<Checkbox
								checked={selectedItems.includes(item)}
								className="mr-2"
							/>
							<span>{item}</span>
						</DropdownMenuCheckboxItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
