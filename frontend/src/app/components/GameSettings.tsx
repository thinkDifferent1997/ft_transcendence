import { Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Props
{
	theme: string;
	setTheme: (theme: string) => void;

	musicEnabled: boolean;
	setMusicEnabled: (value: boolean) => void;

	volume: number;
	setVolume: (value: number) => void;
}

export default function GameSettings({
	theme,
	setTheme,
	musicEnabled,
	setMusicEnabled,
	volume,
	setVolume,
}: Props)
{
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	useEffect(() =>
	{
		function handleClickOutside(event: MouseEvent)
		{
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			)
			{
				setIsOpen(false);
			}
		}

		document.addEventListener(
			"mousedown",
			handleClickOutside,
		);

		return () =>
		{
			document.removeEventListener(
				"mousedown",
				handleClickOutside,
			);
		};
	}, []);

	return (
		<div ref={menuRef}
		className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="
					text-white/70
					hover:text-white
					transition-all
					duration-300
					hover:rotate-90
					active:scale-95
				"
			>
				<Settings className="w-6 h-6" />
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-3 w-80 rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl p-6 z-50">
					<h2 className="text-xl text-white font-bold mb-4">
						Game Settings
					</h2>

					<div className="space-y-3">
						<h3 className="text-white font-semibold">
							Theme
						</h3>

						<button
							onClick={() => setTheme("default")}
							className="block w-full rounded-lg bg-white/10 p-2 text-left text-white hover:bg-white/20"
						>
							Default
						</button>

						<button
							onClick={() =>
							{
								setTheme("forest");
								localStorage.setItem("game-theme", "forest");
							}}
							className="block w-full rounded-lg bg-white/10 p-2 text-left text-white hover:bg-white/20"
						>
							Forest
						</button>

						<button
							onClick={() =>
							{
								setTheme("space");
								localStorage.setItem("game-theme", "space");
							}}
							className="block w-full rounded-lg bg-white/10 p-2 text-left text-white hover:bg-white/20"
						>
							Space
						</button>

						<button
							onClick={() =>
							{
								setTheme("neon");
								localStorage.setItem("game-theme", "neon");
							}}
							className="block w-full rounded-lg bg-white/10 p-2 text-left text-white hover:bg-white/20"
						>
							Neon
						</button>

						<p className="text-white/50 text-sm mt-4">
							Current theme: {theme}
						</p>
					</div>
					<hr className="border-white/10 my-4" />

					<h3 className="text-white font-semibold">
						Music
					</h3>

					<label className="flex items-center justify-between text-white">
						<span>Enable</span>

						<input
							type="checkbox"
							checked={musicEnabled}
							onChange={(e) =>
								setMusicEnabled(e.target.checked)
							}
						/>
					</label>

					<div className="mt-4">

						<div className="flex justify-between text-white text-sm mb-1">
							<span>Volume</span>
							<span>{volume}%</span>
						</div>

						<input
							type="range"
							min="0"
							max="100"
							value={volume}
							onChange={(e) =>
								setVolume(Number(e.target.value))
							}
							className="w-full"
						/>

						<button
							onClick={() =>
							{
								setTheme("default");
								localStorage.setItem(
									"game-theme",
									"default",
								);

								setMusicEnabled(true);

								setVolume(50);
							}}
							className="
								mt-6
								w-full
								rounded-lg
								bg-violet-600
								hover:bg-violet-500
								text-white
								py-2
								transition-colors
							"
						>
							Restore defaults
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
