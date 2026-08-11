import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 px-6 py-10">
			<div className="mx-auto max-w-4xl rounded-3xl border border-white/20 bg-white/10 p-10 text-white shadow-2xl backdrop-blur-md">
				<h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>

				<p className="mb-6 text-white/80">
					Last updated: August 2026
				</p>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						1. Introduction
					</h2>
					<p className="text-white/80">
						This Privacy Policy explains how Culture Quiz collects,
						uses and protects information when you use our multiplayer
						quiz game and its related services.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						2. Information We Collect
					</h2>
					<p className="mb-3 text-white/80">
						Depending on how you use the application, we may collect:
					</p>
					<ul className="list-disc space-y-2 pl-6 text-white/80">
						<li>Username and email address.</li>
						<li>Account authentication information.</li>
						<li>
							Information provided through supported authentication
							providers such as 42 and GitHub.
						</li>
						<li>Game results, scores and statistics.</li>
						<li>Tournament participation and results.</li>
						<li>Information required to maintain an active game session.</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						3. How We Use Your Information
					</h2>
					<p className="mb-3 text-white/80">
						We use this information to:
					</p>
					<ul className="list-disc space-y-2 pl-6 text-white/80">
						<li>Create and manage your account.</li>
						<li>Authenticate you and protect your account.</li>
						<li>Provide multiplayer games and matchmaking.</li>
						<li>Organize and manage tournaments.</li>
						<li>Display profiles, leaderboards and game statistics.</li>
						<li>Maintain the security and reliability of the application.</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						4. Authentication
					</h2>
					<p className="text-white/80">
						Culture Quiz supports several authentication methods,
						including local authentication and third-party authentication
						providers. When using a third-party provider, certain
						identification information may be received from that provider
						in order to create or authenticate your Culture Quiz account.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						5. Cookies and Sessions
					</h2>
					<p className="text-white/80">
						The application uses authentication cookies to maintain your
						session. These cookies are used to authenticate requests and
						maintain access to protected features. Authentication sessions
						may also be associated with an active WebSocket connection
						while you are using multiplayer features.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						6. Data Retention
					</h2>
					<p className="text-white/80">
						Account information and game-related statistics may be retained
						for as long as necessary to provide the application's features.
						Session-related information is removed or invalidated when it
						is no longer required.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						7. Data Security
					</h2>
					<p className="text-white/80">
						We take reasonable technical measures to protect account and
						game data against unauthorized access, modification or
						disclosure. Passwords are not stored in plain text.
						Authentication and sensitive operations are protected by
						appropriate security mechanisms.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						8. Your Rights
					</h2>
					<p className="text-white/80">
						Depending on applicable data protection laws, you may have
						rights concerning your personal information, including the
						right to access, correct or request deletion of your data.
					</p>
				</section>

				<section>
					<h2 className="mb-3 text-2xl font-semibold">
						9. Contact
					</h2>
					<p className="text-white/80">
						If you have questions about this Privacy Policy or the handling
						of your personal information, please contact the Culture Quiz
						project team.
					</p>
				</section>

				<div className="mt-10 text-center">
					<button
						onClick={() => navigate(-1)}
						className="rounded-full bg-white/20 px-6 py-2 text-sm text-white transition hover:bg-white/30"
					>
						← Back
					</button>
				</div>
			</div>
		</div>
	);
}
