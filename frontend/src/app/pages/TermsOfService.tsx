import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 px-6 py-10">
			<div className="mx-auto max-w-4xl rounded-3xl border border-white/20 bg-white/10 p-10 text-white shadow-2xl backdrop-blur-md">
				<h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>

				<p className="mb-6 text-white/80">
					Last updated: August 2026
				</p>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						1. About the Service
					</h2>
					<p className="text-white/80">
						Culture Quiz is a multiplayer quiz game that allows users
						to create an account, play matches against other players or
						AI opponents, participate in tournaments and view game
						statistics and leaderboards.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						2. User Accounts
					</h2>
					<p className="text-white/80">
						You are responsible for the information associated with your
						account and for keeping your authentication credentials secure.
						You must not attempt to access another user's account or
						impersonate another user.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						3. Fair Play
					</h2>
					<p className="text-white/80">
						Users are expected to participate fairly and respectfully.
						Attempts to manipulate matches, matchmaking, tournaments,
						scores or other game systems are not permitted.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						4. Multiplayer and Tournaments
					</h2>
					<p className="text-white/80">
						Multiplayer matches and tournaments may depend on real-time
						connections. Disconnecting from a match may result in a
						forfeit according to the game's rules.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						5. Prohibited Use
					</h2>
					<p className="mb-3 text-white/80">
						Users must not:
					</p>
					<ul className="list-disc space-y-2 pl-6 text-white/80">
						<li>Attempt to compromise the application's security.</li>
						<li>Interfere with other users' games.</li>
						<li>
							Exploit bugs or vulnerabilities to gain an unfair advantage.
						</li>
						<li>Use automated systems to abuse the service.</li>
						<li>
							Attempt unauthorized access to application data or accounts.
						</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						6. Game Content and Statistics
					</h2>
					<p className="text-white/80">
						Game results, scores, rankings and statistics may be displayed
						to other users as part of the application's multiplayer and
						leaderboard features.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						7. Availability
					</h2>
					<p className="text-white/80">
						Culture Quiz is provided as a project and may occasionally
						be unavailable because of maintenance, technical problems or
						other circumstances. We do not guarantee uninterrupted access
						to the service.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="mb-3 text-2xl font-semibold">
						8. Changes to the Service
					</h2>
					<p className="text-white/80">
						The game, its features and its rules may be modified,
						improved or discontinued as the project evolves.
					</p>
				</section>

				<section>
					<h2 className="mb-3 text-2xl font-semibold">
						9. Acceptance
					</h2>
					<p className="text-white/80">
						By using Culture Quiz, you agree to comply with these
						Terms of Service and to use the application responsibly
						and fairly.
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
