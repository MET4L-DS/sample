"use client";

export default function LoadingScreen() {
	return (
		<div className="d-flex align-items-center justify-content-center vh-100 bg-light">
			<div className="text-center">
				<div
					className="spinner-border text-primary mb-3"
					role="status"
					style={{ width: "3rem", height: "3rem" }}
				>
					<span className="visually-hidden">Loading...</span>
				</div>
				<h4 className="text-muted">ChatGPT Clone</h4>
				<p className="text-muted">Initializing your AI assistant...</p>
			</div>
		</div>
	);
}
