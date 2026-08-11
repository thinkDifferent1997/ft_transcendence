import { useState } from "react";

const isImageUrl = (avatar?: string | null): boolean =>  
!!avatar && /^(https?:\/\/|\/)/.test(avatar);

interface AvatarProps {
	src?: string | null;
	alt?: string;
	className?: string;
}

export default function Avatar({
	src,
	alt = "avatar",
		className = "w-10 h-10 text-xl",
}: AvatarProps) {
		const [failed, setFailed] = useState(false);
		const showImage = isImageUrl(src) && !failed;
		return (
			<div
			className={`rounded-full bg-white flex items-center justify-center ring-2 ring-white/50 shadow flex-shrink-0 overflow-hidden ${className}`}
			>
			{showImage ? (
				<img
				src={src!}
				alt={alt}
				className="w-full h-full object-cover"
				referrerPolicy="no-referrer"
				onError={() => setFailed(true)}
				/>
			) : (
			<span>{(!isImageUrl(src) && src) || "😊"}</span>
			)}
			</div>
		);
}
