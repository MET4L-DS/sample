"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import { trpc } from "@/lib/trpc";

export default function HomePage() {
	const [selectedConversationId, setSelectedConversationId] = useState<
		string | null
	>(null);

	const createConversationMutation = trpc.createConversation.useMutation({
		onSuccess: (conversation) => {
			setSelectedConversationId(conversation.id);
		},
	});

	const handleNewConversation = async () => {
		await createConversationMutation.mutateAsync({
			title: "New Chat",
		});
	};

	return (
		<div
			className="d-flex h-100 position-relative bg-dark text-light"
			style={{ height: "100vh", overflow: "hidden" }}
			data-bs-theme="dark"
		>
			{/* Sidebar */}
			<Sidebar
				selectedConversationId={selectedConversationId}
				onSelectConversation={setSelectedConversationId}
				onNewConversation={handleNewConversation}
			/>

			{/* Main Content */}
			<div className="flex-grow-1 d-flex flex-column position-relative">
				{selectedConversationId ? (
					<ChatInterface conversationId={selectedConversationId} />
				) : (
					<div className="flex-grow-1 d-flex align-items-center justify-content-center bg-dark">
						<div className="text-center p-4">
							<h1 className="display-4 mb-4 text-light">
								🤖 ChatGPT Clone
							</h1>
							<p
								className="lead text-light mb-4"
								style={{ opacity: 0.8 }}
							>
								Welcome to your AI-powered chat assistant!
							</p>
							<div className="row g-3">
								<div className="col-12 col-md-6">
									<div className="card h-100 bg-dark border-secondary">
										<div className="card-body text-center">
											<h5 className="card-title text-light">
												💬 Text Chat
											</h5>
											<p
												className="card-text text-light"
												style={{ opacity: 0.8 }}
											>
												Ask questions, get help with
												coding, writing, and more using
												Google's Gemini AI.
											</p>
										</div>
									</div>
								</div>
								<div className="col-12 col-md-6">
									<div className="card h-100 bg-dark border-secondary">
										<div className="card-body text-center">
											<h5 className="card-title text-light">
												🎨 Image Generation
											</h5>
											<p
												className="card-text text-light"
												style={{ opacity: 0.8 }}
											>
												Describe what you want to see
												and let AI generate creative
												descriptions and images.
											</p>
										</div>
									</div>
								</div>
							</div>
							<div className="mt-4">
								<p
									className="small text-light"
									style={{ opacity: 0.6 }}
								>
									Start a new conversation to begin chatting
									with AI!
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
