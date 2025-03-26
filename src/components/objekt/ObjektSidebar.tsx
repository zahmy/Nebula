interface ObjektsSidebarProps {
	text_color: string;
	collection: string;
	serial?: number;
}

// Objekt的sidebar元件
export function ObjektSidebar({
	text_color,
	collection,
	serial,
}: ObjektsSidebarProps) {
	const paddedSerial =
		serial === undefined || isNaN(serial)
			? ""
			: serial.toString().padStart(5, "0");
	// console.log("text_color:", text_color);
	// console.log("serial:", serial);
	return (
		<div
			className="absolute h-full items-center w-[11%] pr-10.5 flex gap-2 justify-center top-0 right-0 [writing-mode:vertical-lr] font-semibold text-[var(--objekt-text-color)] select-none"
			style={{
				color: text_color,
				fontSize: `12px`,
			}}
		>
			<span>{collection}</span>
			{paddedSerial && <span>#{paddedSerial}</span>}
		</div>
	);
}
