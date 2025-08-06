import {
	Github,
	Info,
	ExternalLink,
	Shield,
	Smartphone,
	Monitor
} from "lucide-react";
import {logo1} from "@/assets/images";
import {versionInfo} from "@/constants/versionInfo.ts";
import {Link} from "react-router";

export default function About() {
	return (
		<div className="max-w-4xl mx-auto px-6 py-10 text-gray-100 rounded-lg shadow-lg">
			{/* Header */}
			<div className="flex items-center gap-4 mb-6">
				<img alt={"sidecast logo"} src={logo1} className={"size-60"} />
				<div>
					<h1 className="text-3xl font-quicksand-bold">SideCast</h1>
					<p className="text-sm text-gray-400 font-quicksand-regular">
						Mirror and control your Android device seamlessly
					</p>
				</div>
			</div>

			{/* Version */}
			<p className="text-sm text-gray-400 mb-4 font-quicksand-light">
				Version {versionInfo.version}
			</p>

			{/* Description */}
			<p className="mb-6 font-quicksand-regular">
				<strong className="font-quicksand-semibold">SideCast</strong> is a lightweight,
				cross-platform desktop application built with Electron that allows you to
				mirror and interact with your Android devices using ADB and scrcpy. It's fast,
				simple, and completely local — no internet required.
			</p>

			{/* Features */}
			<div className="mb-6">
				<h2 className="text-xl font-quicksand-semibold mb-2">Key Features</h2>
				<ul className="list-disc list-inside space-y-1 text-gray-300 font-quicksand-regular">
					<li>Live screen mirroring using scrcpy</li>
					<li>USB and Wi-Fi ADB connection support</li>
					<li>Multi-device management</li>
					<li>Customizable quality and resolution</li>
					<li>Screen recording & screenshots</li>
					<li>Realtime log viewer</li>
				</ul>
			</div>

			{/* Technologies */}
			<div className="mb-6">
				<h2 className="text-xl font-quicksand-semibold mb-2">Powered By</h2>
				<ul className="list-disc list-inside space-y-1 text-gray-300 font-quicksand-regular">
					<li>Electron & Node.js</li>
					<li>scrcpy (by Genymobile)</li>
					<li>Android Debug Bridge (ADB)</li>
					<li>shadcnui</li>
					<li>Tailwind CSS & Lucide Icons</li>
				</ul>
			</div>

			{/* Links */}
			<div className="mb-6">
				<h2 className="text-xl font-quicksand-semibold mb-2">Resources</h2>
				<ul className="space-y-2 text-blue-400 font-quicksand-regular">
					<li className="flex items-center gap-2">
						<Github className="w-4 h-4" />
						<Link

							to="https://github.com/donymvarkey/side-cast"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub Repository
						</Link>
					</li>
					<li className="flex items-center gap-2">
						<Shield className="w-4 h-4" />
						<a href="#" target="_blank" rel="noopener noreferrer">
							License (MIT)
						</a>
					</li>
					<li className="flex items-center gap-2">
						<Info className="w-4 h-4" />
						<a href="#" target="_blank" rel="noopener noreferrer">
							Privacy Notice
						</a>
					</li>
				</ul>
			</div>

			{/* Footer */}
			<div className="text-sm text-gray-500 mt-10 border-t border-gray-700 pt-4 font-quicksand-light">
				<p>Developed by Dony M Varkey · © {new Date().getFullYear()} SideCast</p>
			</div>
		</div>
	);
}
