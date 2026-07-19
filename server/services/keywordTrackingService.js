import { rankTracker } from "./rankTrackerService.js";

export async function keywordTracking(tracking) {
    try {
        let result;

        // Fresh Browserbase sessions make transient Google/session failures recoverable.
        for (let attempt = 1; attempt <= 3; attempt++) {
            result = await rankTracker(tracking.keyword, tracking.domain);
            if (result.success && result.data.totalResultsScanned > 0) break;
            if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 3000));
        }

        if (result?.success && result.data.totalResultsScanned > 0) {
            const prev = tracking.currentPosition;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            tracking.currentPosition = result.data.position;
            tracking.currentPage = result.data.page;
            tracking.competitors = result.data.competitors;
            tracking.lastChecked = new Date();
            tracking.status = "completed";
            tracking.lastError = "";

            // Update stats
            tracking.positionChange = prev && result.data.position ? prev - result.data.position : 0;
            if (result.data.position && (!tracking.bestPosition || result.data.position < tracking.bestPosition)) {
                tracking.bestPosition = result.data.position;
            }

            // Update history
            const historyEntry = {
                date: today,
                position: result.data.position,
                page: result.data.page,
                title: result.data.title,
                snippet: result.data.snippet,
            };
            tracking.rankHistory.push(historyEntry);
        } else {
            tracking.status = "failed";
            tracking.lastError = result?.error || "Google returned no usable organic results";
            result = { success: false, error: tracking.lastError };
        }
        await tracking.save();
        return result;
    } catch (err) {
        console.error("Rank update error:", err.message);
        tracking.status = "failed";
        tracking.lastError = err.message;
        await tracking.save().catch(() => {});
        return { success: false, error: err.message };
    }
}
