"use client";

import { useUser } from "@auth0/nextjs-auth0";

export default function AuthButton() {
	const { user, isLoading } = useUser();

	if (isLoading) return <div>Loading...</div>;

	if (user) {
		return (
			<div className="d-flex align-items-center gap-2">
				<img
					src={user.picture || "/default-avatar.png"}
					alt={user.name || "User"}
					width={32}
					height={32}
					className="rounded-circle"
				/>
				<span className="text-light">{user.name}</span>
				<a href="/auth/logout" className="btn btn-outline-light btn-sm">
					Logout
				</a>
			</div>
		);
	}

	return (
		<a href="/auth/login" className="btn btn-primary">
			Login
		</a>
	);
}
