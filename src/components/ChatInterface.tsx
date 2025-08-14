"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Message } from "@/lib/supabase";

interface ChatInterfaceProps {
	conversationId: string;
}

export default function ChatInterface({ conversationId }: ChatInterfaceProps) {
	const [newMessage, setNewMessage] = useState("");
	const [modelType, setModelType] = useState<"text" | "image">("text");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const { data: messages, refetch: refetchMessages } =
		trpc.getMessages.useQuery({ conversationId });
	const sendMessageMutation = trpc.sendMessage.useMutation({
		onSuccess: () => {
			refetchMessages();
			setNewMessage("");
		},
	});

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMessage.trim()) return;

		await sendMessageMutation.mutateAsync({
			content: newMessage,
			conversationId,
			modelType,
		});
	};

	return (
		<div
			className="d-flex flex-column h-100 bg-dark text-light"
			data-bs-theme="dark"
		>
			{/* Messages Area */}
			<div
				className="flex-grow-1 overflow-auto p-3 bg-dark"
				style={{ maxHeight: "calc(100vh - 200px)" }}
			>
				{messages?.map((message: Message) => (
					<div
						key={message.id}
						className={`mb-3 d-flex ${
							message.role === "user"
								? "justify-content-end"
								: "justify-content-start"
						}`}
					>
						<div
							className={`px-3 py-2 rounded-3 max-width-75 ${
								message.role === "user"
									? "bg-primary text-white"
									: "bg-secondary text-light border-secondary"
							}`}
							style={{ maxWidth: "75%", wordWrap: "break-word" }}
						>
							<div className="small fw-bold mb-1">
								{message.role === "user"
									? "You"
									: "AI Assistant"}
							</div>
							<div style={{ whiteSpace: "pre-wrap" }}>
								{message.content}
							</div>
							<div className="small text-muted mt-1">
								{new Date(
									message.created_at
								).toLocaleTimeString()}
							</div>
						</div>
					</div>
				))}
				{sendMessageMutation.isPending && (
					<div className="d-flex justify-content-start mb-3">
						<div className="bg-secondary text-light border-secondary px-3 py-2 rounded-3">
							<div className="d-flex align-items-center">
								<div
									className="spinner-border spinner-border-sm me-2 text-light"
									role="status"
								>
									<span className="visually-hidden">
										Loading...
									</span>
								</div>
								AI is thinking...
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Area */}
			<div className="border-top border-secondary bg-dark p-3">
				{/* Model Type Selector */}
				<div className="mb-2">
					<div className="btn-group w-100" role="group">
						<input
							type="radio"
							className="btn-check"
							name="modelType"
							id="textModel"
							checked={modelType === "text"}
							onChange={() => setModelType("text")}
						/>
						<label
							className="btn btn-outline-light"
							htmlFor="textModel"
						>
							💬 Text Chat
						</label>

						<input
							type="radio"
							className="btn-check"
							name="modelType"
							id="imageModel"
							checked={modelType === "image"}
							onChange={() => setModelType("image")}
						/>
						<label
							className="btn btn-outline-light"
							htmlFor="imageModel"
						>
							🎨 Image Gen
						</label>
					</div>
				</div>

				{/* Message Input */}
				<form onSubmit={handleSendMessage}>
					<div className="input-group">
						<textarea
							className="form-control bg-dark text-light border-secondary"
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							placeholder={
								modelType === "text"
									? "Type your message..."
									: "Describe the image you want to generate..."
							}
							rows={2}
							disabled={sendMessageMutation.isPending}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSendMessage(e);
								}
							}}
							style={{
								backgroundColor: "#212529",
								borderColor: "#6c757d",
								color: "#fff",
							}}
						/>
						<button
							type="submit"
							className="btn btn-primary"
							disabled={
								!newMessage.trim() ||
								sendMessageMutation.isPending
							}
						>
							{sendMessageMutation.isPending ? (
								<div
									className="spinner-border spinner-border-sm"
									role="status"
								>
									<span className="visually-hidden">
										Loading...
									</span>
								</div>
							) : (
								"📤"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
