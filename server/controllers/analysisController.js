import Analysis from "../models/Analysis.js";
import User from "../models/User.js";
import { analyzeSeoData } from "../services/geminiService.js";
import { scrapeUrl } from "../services/scraperService.js";

const isUnsafeHostname = (hostname) => {
    const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (host === "localhost" || host === "::1" || host.endsWith(".local")) return true;
    const match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!match) return false;
    const [, a, b] = match.map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
};

// Analyze a URL
export const analyzeUrl = async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) return res.status(400).json({ success: false, message: "URL is required" });

        // Validate URL format
        let validUrl;
        try {
            validUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
            if (!["http:", "https:"].includes(validUrl.protocol) || isUnsafeHostname(validUrl.hostname)) {
                return res.status(400).json({ success: false, message: "Only public HTTP or HTTPS URLs are supported" });
            }
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid URL format" });
        }

        // Step 1 — Atomic daily reset (only matches if lastAnalysisDate is null or not today UTC)
        const todayStart = new Date(Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            new Date().getUTCDate()
        ));
        await User.updateOne(
            {
                _id: req.userId,
                $or: [
                    { lastAnalysisDate: null },
                    { lastAnalysisDate: { $lt: todayStart } },
                ],
            },
            { $set: { analysisCount: 0, lastAnalysisDate: todayStart } }
        );

        // Step 2 — Atomic increment with limit check (single source of truth)
        const updatedUser = await User.findOneAndUpdate(
            {
                _id: req.userId,
                $expr: {
                    $or: [
                        { $ne: ["$plan", "free"] },
                        { $lt: ["$analysisCount", 5] },
                    ],
                },
            },
            { $inc: { analysisCount: 1 }, $set: { lastAnalysisDate: new Date() } },
            { new: true, projection: { plan: 1, analysisCount: 1 } }
        );

        if (!updatedUser) {
            return res.status(429).json({
                success: false,
                message: "Daily analysis limit reached. Please try again tomorrow.",
            });
        }

        // Create analysis record with pending status
        const analysis = await Analysis.create({ userId: req.userId, url: validUrl.href, status: "processing" });

        // Send immediate response with analysis ID
        res.json({ success: true, message: "Analysis started", analysisId: analysis._id });

        // Run scraping and analysis in background
        try {
            // Step 1: Scrape the URL with BrowserBase
            const scrapeResult = await scrapeUrl(validUrl.href);

            if (!scrapeResult.success) {
                analysis.status = "failed";
                await analysis.save();
                return;
            }

            // Step 2: Analyze with Gemini AI
            const aiResult = await analyzeSeoData(scrapeResult.data);

            if (!aiResult.success) {
                analysis.status = "failed";
                await analysis.save();
                return;
            }

            // Step 3: Save results
            analysis.overallScore = aiResult.data.overallScore || 0;
            analysis.categories = aiResult.data.categories || {};
            analysis.metaData = scrapeResult.data.metaData || {};
            analysis.headings = scrapeResult.data.headings || {};
            analysis.links = scrapeResult.data.links || {};
            analysis.images = scrapeResult.data.images || {};
            analysis.keywords = aiResult.data.keywords || [];
            analysis.issues = aiResult.data.issues || [];
            analysis.loadTime = scrapeResult.data.loadTime || 0;
            analysis.pageSize = scrapeResult.data.pageSize || 0;
            analysis.wordCount = scrapeResult.data.wordCount || 0;
            analysis.status = "completed";

            await analysis.save();
        } catch (bgError) {
            console.error("Background analysis error:", bgError.message);
            try {
                analysis.status = "failed";
                await analysis.save();
            } catch (saveError) {
                console.error("Failed to save failed status:", saveError.message);
            }
        }
    } catch (error) {
        console.error("Analyze URL error:", error.message);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Server error" });
        }
    }
};

// Get analysis by ID
export const getAnalysis = async (req, res) => {
    try {
        const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.userId });

        if (!analysis) return res.status(404).json({ success: false, message: "Analysis not found" });

        res.json({ success: true, analysis });
    } catch (error) {
        console.error("Get analysis error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get all analyses for user
export const getAnalyses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [analyses, total] = await Promise.all([
            Analysis.find({ userId: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-issues -keywords"),
            Analysis.countDocuments({ userId: req.userId }),
        ]);

        res.json({ success: true, analyses, totalCount: total, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        console.error("Get analyses error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Delete analysis
export const deleteAnalysis = async (req, res) => {
    try {
        const analysis = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!analysis) return res.status(404).json({ success: false, message: "Analysis not found" });
        res.json({ success: true, message: "Analysis deleted" });
    } catch (error) {
        console.error("Delete analysis error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
