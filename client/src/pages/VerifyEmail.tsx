import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ChartNoAxesColumnIcon } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const { verifyEmail } = useApp();
    const [status, setStatus] = useState<"loading" | "success" | "error" | "alreadyVerified">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setStatus("error");
            setMessage("No verification token provided.");
            return;
        }

        (async () => {
            const result = await verifyEmail(token);
            if (result.success) {
                if (result.message === "Email already verified") {
                    setStatus("alreadyVerified");
                } else {
                    setStatus("success");
                }
                setMessage(result.message);
            } else {
                setStatus("error");
                setMessage(result.message);
            }
        })();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="flex items-center justify-center gap-2 group mb-10">
                        <ChartNoAxesColumnIcon />
                        <span className="text-xl tracking-tight text-foreground">Rank Pilot</span>
                    </Link>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                    {status === "loading" && (
                        <div>
                            <Loader2 size={48} className="mx-auto text-primary animate-spin mb-4" />
                            <h1 className="text-xl font-medium text-foreground">Verifying your email...</h1>
                        </div>
                    )}

                    {status === "success" && (
                        <div>
                            <CheckCircle2 size={64} className="mx-auto text-success mb-4" />
                            <h1 className="text-2xl font-medium text-foreground mb-2">Email Verified!</h1>
                            <p className="text-muted-foreground text-sm mb-6">{message}</p>
                            <Link
                                to="/dashboard"
                                className="inline-block px-6 py-3 rounded-lg bg-primary text-sm font-medium"
                                style={{ color: "var(--background)" }}
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    )}

                    {status === "alreadyVerified" && (
                        <div>
                            <CheckCircle2 size={64} className="mx-auto text-success mb-4" />
                            <h1 className="text-2xl font-medium text-foreground mb-2">Email Already Verified</h1>
                            <p className="text-muted-foreground text-sm mb-6">Your email has already been verified. You can continue to your dashboard.</p>
                            <Link
                                to="/dashboard"
                                className="inline-block px-6 py-3 rounded-lg bg-primary text-sm font-medium"
                                style={{ color: "var(--background)" }}
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    )}

                    {status === "error" && (
                        <div>
                            <XCircle size={64} className="mx-auto text-danger mb-4" />
                            <h1 className="text-2xl font-medium text-foreground mb-2">Verification Failed</h1>
                            <p className="text-muted-foreground text-sm mb-6">{message}</p>
                            <Link
                                to="/login"
                                className="inline-block px-6 py-3 rounded-lg bg-primary text-sm font-medium"
                                style={{ color: "var(--background)" }}
                            >
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
