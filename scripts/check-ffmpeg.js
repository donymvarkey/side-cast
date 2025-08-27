#!/usr/bin/env node

/**
 * FFmpeg Installation Check Script
 * Run this script to verify FFmpeg is properly installed
 */

import { execa } from "execa";
import process from "node:process";

async function checkFFmpeg() {
  console.log("🔍 Checking FFmpeg installation...\n");

  try {
    // Check FFmpeg version
    const { stdout } = await execa("ffmpeg", ["-version"]);
    console.log("✅ FFmpeg is installed!");
    console.log("📋 Version info:");
    console.log(stdout.split("\n")[0]); // First line contains version info

    // Test basic functionality
    console.log("\n🧪 Testing FFmpeg functionality...");
    await execa("ffmpeg", [
      "-f",
      "lavfi",
      "-i",
      "testsrc=duration=1:size=320x240:rate=1",
      "-f",
      "null",
      "-",
    ]);
    console.log("✅ FFmpeg is working correctly!");

    console.log("\n🎉 FFmpeg is ready for video optimization!");
    console.log(
      "   Your scrcpy screen recordings will be automatically optimized for macOS."
    );
  } catch (error) {
    console.log("❌ FFmpeg is not installed or not working properly.");
    console.log("\n📥 Installation instructions:");

    const platform = process.platform;
    switch (platform) {
      case "darwin":
        console.log("   macOS: brew install ffmpeg");
        console.log("   Or download from: https://ffmpeg.org/download.html");
        break;
      case "win32":
        console.log(
          "   Windows: Download from https://ffmpeg.org/download.html"
        );
        console.log("   Or use Chocolatey: choco install ffmpeg");
        break;
      case "linux":
        console.log(
          "   Ubuntu/Debian: sudo apt update && sudo apt install ffmpeg"
        );
        console.log("   CentOS/RHEL: sudo yum install ffmpeg");
        console.log("   Or download from: https://ffmpeg.org/download.html");
        break;
      default:
        console.log("   Download from: https://ffmpeg.org/download.html");
    }

    console.log(
      "\n⚠️  Without FFmpeg, recorded videos may not play properly on macOS."
    );
    process.exit(1);
  }
}

checkFFmpeg().catch(console.error);
