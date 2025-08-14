// Utility functions for the chat application

export const formatTimestamp = (timestamp: string): string => {
	const date = new Date(timestamp);
	const now = new Date();
	const diffInMs = now.getTime() - date.getTime();
	const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

	if (diffInMinutes < 1) {
		return "Just now";
	} else if (diffInMinutes < 60) {
		return `${diffInMinutes}m ago`;
	} else if (diffInHours < 24) {
		return `${diffInHours}h ago`;
	} else if (diffInDays < 7) {
		return `${diffInDays}d ago`;
	} else {
		return date.toLocaleDateString();
	}
};

export const truncateText = (text: string, maxLength: number = 50): string => {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength) + "...";
};

export const generateConversationTitle = (firstMessage: string): string => {
	const truncated = truncateText(firstMessage, 30);
	return truncated || `Chat ${new Date().toLocaleDateString()}`;
};

export const scrollToBottom = (element: HTMLElement | null) => {
	if (element) {
		element.scrollTop = element.scrollHeight;
	}
};

export const isValidUUID = (str: string): boolean => {
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(str);
};

export const debounce = <T extends (...args: any[]) => any>(
	func: T,
	wait: number
): ((...args: Parameters<T>) => void) => {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
};

export const generateId = (): string => {
	return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		console.error("Failed to copy text: ", err);
		return false;
	}
};

export const downloadAsFile = (
	content: string,
	filename: string,
	mimeType: string = "text/plain"
) => {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export const isMobileDevice = (): boolean => {
	return window.innerWidth <= 768;
};

export const getDeviceType = (): "mobile" | "tablet" | "desktop" => {
	const width = window.innerWidth;
	if (width <= 768) return "mobile";
	if (width <= 992) return "tablet";
	return "desktop";
};
