"use client";

import { useState } from "react";
import { Message } from "@/lib/supabase";
import { formatTimestamp, copyToClipboard } from "@/lib/utils";

interface MessageBubbleProps {
	message: Message;
	onDelete?: (messageId: string) => void;
	onEdit?: (messageId: string, newContent: string) => void;
}

export default function MessageBubble({
	message,
	onDelete,
	onEdit,
}: MessageBubbleProps) {
	const [showActions, setShowActions] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(message.content);
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		const success = await copyToClipboard(message.content);
		if (success) {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleEdit = () => {
		if (onEdit) {
			onEdit(message.id, editContent);
			setIsEditing(false);
		}
	};

	const handleDelete = () => {
		if (
			onDelete &&
			confirm("Are you sure you want to delete this message?")
		) {
			onDelete(message.id);
		}
	};

	return (
		<div
			className={`mb-3 d-flex ${
				message.role === "user"
					? "justify-content-end"
					: "justify-content-start"
			}`}
			onMouseEnter={() => setShowActions(true)}
			onMouseLeave={() => setShowActions(false)}
		>
			<div className="position-relative" style={{ maxWidth: "75%" }}>
				<div
					className={`px-3 py-2 rounded-3 message-bubble ${
						message.role === "user"
							? "bg-primary text-white"
							: "bg-light text-dark border"
					}`}
					style={{ wordWrap: "break-word" }}
				>
					<div className="small fw-bold mb-1">
						{message.role === "user" ? "You" : "AI Assistant"}
					</div>

					{isEditing ? (
						<div>
							<textarea
								className="form-control mb-2"
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								rows={3}
							/>
							<div className="d-flex gap-1">
								<button
									className="btn btn-sm btn-success"
									onClick={handleEdit}
								>
									Save
								</button>
								<button
									className="btn btn-sm btn-secondary"
									onClick={() => {
										setIsEditing(false);
										setEditContent(message.content);
									}}
								>
									Cancel
								</button>
							</div>
						</div>
					) : (
						<div style={{ whiteSpace: "pre-wrap" }}>
							{message.content}
						</div>
					)}

					<div className="small text-muted mt-1">
						{formatTimestamp(message.created_at)}
					</div>
				</div>

				{/* Message Actions */}
				{showActions && !isEditing && (
					<div
						className={`position-absolute ${
							message.role === "user" ? "start-0" : "end-0"
						} top-0 mt-1`}
						style={{
							transform:
								message.role === "user"
									? "translateX(-100%)"
									: "translateX(100%)",
						}}
					>
						<div
							className="btn-group-vertical"
							style={{ fontSize: "12px" }}
						>
							<button
								className="btn btn-sm btn-outline-secondary"
								onClick={handleCopy}
								title="Copy message"
							>
								{copied ? "✓" : "📋"}
							</button>

							{message.role === "user" && onEdit && (
								<button
									className="btn btn-sm btn-outline-secondary"
									onClick={() => setIsEditing(true)}
									title="Edit message"
								>
									✏️
								</button>
							)}

							{onDelete && (
								<button
									className="btn btn-sm btn-outline-danger"
									onClick={handleDelete}
									title="Delete message"
								>
									🗑️
								</button>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
