import KeywordTracking from "../models/keywordTracking.js";
import { keywordTracking } from "../services/keywordTrackingService.js";

//Add a keyword to track
export const addKeyword = async (req, res) => {
    try {
        const {keyword, url} = req.body;
        if(!keyword || !url){
            return res.status(400).json({message: 'Keyword and URL are required'});
        }
        //Extract domain from URL
        let domain;
        try {
            const urlObj = new URL(url.startsWith('http')? url : `https://${url}`);
            if (!['http:', 'https:'].includes(urlObj.protocol) || !urlObj.hostname.includes('.')) {
                return res.status(400).json({success: false, message: 'Enter a valid public website URL'});
            }
            domain = urlObj.hostname.replace('www.','');
        } catch {
            return res.status(400).json({success: false, message: 'Invalid URL format'});
        }

        //Check if already tracking this keyword+domain
        const existing = await KeywordTracking.findOne({userId: req.userId, keyword: keyword.toLowerCase().trim(), domain});

        if(existing){
            return res.status(400).json({success: false, message: 'Already tracking this keyword for this domain'});
        }

        //Create tracking entry
        const tracking = await KeywordTracking.create({
            userId: req.userId,
            keyword: keyword.toLowerCase().trim(),
            url: url.startsWith('http')? url : `https://${url}`,
            domain,
            status: 'checking'
        });
        const result = await keywordTracking(tracking);
        if (!result.success) {
            return res.status(502).json({ success: false, message: tracking.lastError || "Rank check failed", tracking });
        }
        res.status(201).json({success: true, message: 'Keyword tracking completed', tracking});

    } catch (error) {
        console.error("Add keyword error:", error.message);
        if (error.code === 11000) return res.status(400).json({ success: false, message: "Already tracking this keyword" });
        res.status(500).json({ success: false, message: "Server error" });
    }
}

//Get all tracked keywords for a user
export const getKeywords = async (req, res) => {
    try {
            const keywords = await KeywordTracking.find({ userId: req.userId }).sort({ createdAt: -1 }).select("-rankHistory");
            res.json({ success: true, keywords });
        } catch (error) {
            console.error("Get keywords error:", error.message);
            res.status(500).json({ success: false, message: "Server error" });
        }
}

//Get full details of a specific tracked keyword
export const getKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOne({ _id: req.params.id, userId: req.userId });
        if (!tracking) return res.status(404).json({ success: false, message: "Keyword tracking not found" });
        res.json({ success: true, tracking });
    } catch (error) {
        console.error("Get keyword error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

//Manually refresh a keyword ranking
export const refreshKeyword = async (req, res) => {
    try {
            const tracking = await KeywordTracking.findOne({ _id: req.params.id, userId: req.userId });
            if (!tracking) return res.status(404).json({ success: false, message: "Keyword tracking not found" });
            const checkIsFresh = tracking.status === "checking" && Date.now() - tracking.updatedAt.getTime() < 10 * 60 * 1000;
            if (checkIsFresh) {
                return res.status(409).json({ success: false, message: "A rank check is already in progress" });
            }
            tracking.status = "checking";
            tracking.lastError = "";
            await tracking.save();
            const result = await keywordTracking(tracking);
            if (!result.success) {
                return res.status(502).json({ success: false, message: tracking.lastError || "Rank check failed", tracking });
            }
            res.json({ success: true, message: "Rank check completed", tracking });
        } catch (error) {
            console.error("Refresh keyword error:", error.message);
            res.status(500).json({ success: false, message: "Server error" });
        }
}

//Delete keyword tracking
export const deleteKeyword = async (req,res) => {
    try {
            const tracking = await KeywordTracking.findOneAndDelete({ _id: req.params.id, userId: req.userId });
            if (!tracking) return res.status(404).json({ success: false, message: "Keyword tracking not found" });
    
            res.json({ success: true, message: "Keyword tracking deleted" });
        } catch (error) {
            console.error("Delete keyword error:", error.message);
            res.status(500).json({ success: false, message: "Server error" });
        }
}

//Toggle tracking active/inactive
export const toggleTracking = async (req,res) => {
    try {
            const tracking = await KeywordTracking.findOne({ _id: req.params.id, userId: req.userId });
            if (!tracking) return res.status(404).json({ success: false, message: "Keyword tracking not found" });
    
            tracking.active = !tracking.active;
            await tracking.save();
    
            res.json({ success: true, tracking });
        } catch (error) {
            console.error("Toggle tracking error:", error.message);
            res.status(500).json({ success: false, message: "Server error" });
        }
}

// Run scheduled checks from Vercel Cron or another trusted scheduler.
export const runScheduledTracking = async (req, res) => {
    if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const trackings = await KeywordTracking.find({ active: true });
        let completed = 0;
        let failed = 0;

        for (let index = 0; index < trackings.length; index += 2) {
            const batch = trackings.slice(index, index + 2);
            const results = await Promise.allSettled(batch.map(async (tracking) => {
                tracking.status = "checking";
                tracking.lastError = "";
                await tracking.save();
                return keywordTracking(tracking);
            }));
            results.forEach((result) => {
                if (result.status === "fulfilled" && result.value?.success) completed++;
                else failed++;
            });
        }

        res.json({ success: true, checked: trackings.length, completed, failed });
    } catch (error) {
        console.error("Scheduled rank tracking error:", error.message);
        res.status(500).json({ success: false, message: "Scheduled rank tracking failed" });
    }
};
