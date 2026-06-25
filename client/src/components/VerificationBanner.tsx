import { useEffect, useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

export default function VerificationBanner() {
    const { user, resendVerification } = useApp();
    const [dismissed, setDismissed] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        setDismissed(false);
    }, [user?.id]);

    if (!user || user.emailVerified || dismissed) return null;

    const handleResend = async () => {
        setSending(true);
        const result = await resendVerification();
        setSending(false);
        if (result.success) {
            toast.success("Verification email sent!");
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="bg-warning/10 border-b border-warning/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-foreground">
                    <AlertTriangle size={16} className="text-warning shrink-0" />
                    <span>
                        Please verify your email address.{" "}
                        <button
                            onClick={handleResend}
                            disabled={sending}
                            className="text-primary hover:underline font-medium disabled:opacity-50"
                        >
                            {sending ? "Sending..." : "Resend verification email"}
                        </button>
                    </span>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                    aria-label="Dismiss"
                >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                </button>
            </div>
        </div>
    );
}
