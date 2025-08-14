"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Conversation } from "@/lib/supabase";

interface SidebarProps {
	selectedConversationId: string | null;
	onSelectConversation: (conversationId: string) => void;
	onNewConversation: () => void;
	isCollapsed?: boolean;
	onToggleCollapsed?: () => void;
}

export default function Sidebar({
	selectedConversationId,
	onSelectConversation,
	onNewConversation,
	isCollapsed = false,
	onToggleCollapsed,
}: SidebarProps) {
	const [isOpen, setIsOpen] = useState(false);

	const { data: conversations, refetch: refetchConversations } =
		trpc.getConversations.useQuery();
	const createConversationMutation = trpc.createConversation.useMutation({
		onSuccess: (data) => {
			refetchConversations();
			onSelectConversation(data.id);
			setIsOpen(false);
		},
	});
	const deleteConversationMutation = trpc.deleteConversation.useMutation({
		onSuccess: () => {
			refetchConversations();
		},
	});

	const handleNewConversation = async () => {
		await createConversationMutation.mutateAsync({
			title: `Chat ${new Date().toLocaleDateString()}`,
		});
		onNewConversation();
	};

	const handleDeleteConversation = async (
		conversationId: string,
		e: React.MouseEvent
	) => {
		e.stopPropagation();
		if (confirm("Are you sure you want to delete this conversation?")) {
			await deleteConversationMutation.mutateAsync({ conversationId });
			if (selectedConversationId === conversationId) {
				onSelectConversation("");
			}
		}
	};

	return (
		<>
			{/* Mobile Menu Button - only show on mobile */}
			<button
				className="btn btn-outline-light d-lg-none position-fixed top-0 start-0 m-2"
				onClick={() => setIsOpen(!isOpen)}
				style={{ zIndex: 1050 }}
			>
				☰
			</button>

			{/* Desktop Menu Button - only show on desktop */}
			{onToggleCollapsed && (
				<button
					className="btn btn-outline-light d-none d-lg-block position-fixed top-0 m-2"
					onClick={onToggleCollapsed}
					style={{
						zIndex: 1050,
						left: isCollapsed ? "0.5rem" : "292px", // 280px sidebar width + 12px margin
					}}
				>
					☰
				</button>
			)}

			{/* Overlay for mobile */}
			{isOpen && (
				<div
					className="position-fixed w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
					style={{ zIndex: 1040 }}
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Sidebar - always visible on desktop (unless collapsed), toggle on mobile */}
			<div
				className={`h-100 bg-dark border-end border-secondary d-flex flex-column ${
					// Mobile: show only when isOpen is true
					isOpen ? "d-flex position-fixed" : "d-none"
				} ${
					// Desktop: show unless collapsed
					isCollapsed ? "d-lg-none" : "d-lg-flex"
				} position-lg-static`}
				style={{
					width: "280px",
					zIndex: 1045,
				}}
				data-bs-theme="dark"
			>
				{/* Header */}
				<div className="p-3 border-bottom border-secondary">
					<div className="d-flex justify-content-between align-items-center">
						<h5 className="mb-0 text-light">ChatGPT Clone</h5>
						<button
							className="btn btn-sm btn-outline-light d-lg-none"
							onClick={() => setIsOpen(false)}
						>
							✕
						</button>
					</div>
				</div>

				{/* New Conversation Button */}
				<div className="p-3">
					<button
						className="btn btn-primary w-100"
						onClick={handleNewConversation}
						disabled={createConversationMutation.isPending}
					>
						{createConversationMutation.isPending ? (
							<div
								className="spinner-border spinner-border-sm me-2"
								role="status"
							>
								<span className="visually-hidden">
									Loading...
								</span>
							</div>
						) : (
							"+ "
						)}
						New Chat
					</button>
				</div>

				{/* Conversations List */}
				<div className="flex-grow-1 overflow-auto">
					{conversations?.map((conversation: Conversation) => (
						<div
							key={conversation.id}
							className={`p-3 border-bottom border-secondary cursor-pointer position-relative text-light ${
								selectedConversationId === conversation.id
									? "bg-secondary"
									: ""
							}`}
							onClick={() => {
								onSelectConversation(conversation.id);
								setIsOpen(false);
							}}
							style={{ cursor: "pointer" }}
							onMouseEnter={(e) => {
								if (
									selectedConversationId !== conversation.id
								) {
									e.currentTarget.style.backgroundColor =
										"#495057";
								}
							}}
							onMouseLeave={(e) => {
								if (
									selectedConversationId !== conversation.id
								) {
									e.currentTarget.style.backgroundColor = "";
								}
							}}
						>
							<div className="d-flex justify-content-between align-items-start">
								<div className="flex-grow-1 me-2">
									<div
										className="fw-medium text-truncate text-light"
										style={{ maxWidth: "180px" }}
									>
										{conversation.title}
									</div>
									<div className="small text-muted">
										{new Date(
											conversation.created_at
										).toLocaleDateString()}
									</div>
								</div>
								<button
									className="btn btn-sm btn-outline-danger"
									onClick={(e) =>
										handleDeleteConversation(
											conversation.id,
											e
										)
									}
									disabled={
										deleteConversationMutation.isPending
									}
									style={{
										fontSize: "12px",
										padding: "2px 6px",
									}}
								>
									🗑️
								</button>
							</div>
						</div>
					))}
				</div>

				{/* Footer */}
				<div className="p-3 border-top border-secondary">
					<div className="small text-muted text-center">
						Powered by Google Gemini AI
					</div>
				</div>
			</div>
		</>
	);
}
