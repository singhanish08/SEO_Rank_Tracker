import { useState } from "react";
import { Link } from "react-router-dom";
import {
    Mail,
    Loader2,
    CheckCircle2,
    ChartNoAxesColumnIcon,
    ArrowLeft,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ForgotPassword() {
    const { forgotPassword } = useApp();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        await forgotPassword(email);
        setLoading(false);
        setSent(true);
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 group"
                        >
                            <ChartNoAxesColumnIcon />
                            <span className="text-xl tracking-tight text-foreground">
                                Rank Pilot
                            </span>
                        </Link>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-8 text-center">
                        <CheckCircle2
                            size={64}
                            className="mx-auto text-success mb-4"
                        />

                        <h1 className="text-2xl font-medium text-foreground mb-2">
                            Check Your Email
                        </h1>

                        <p className="text-muted-foreground text-sm mb-6">
                            If an account exists with{" "}
                            <strong className="text-foreground">
                                {email}
                            </strong>
                            , we've sent a password reset link.
                        </p>

                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                            <ArrowLeft size={16} />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 group"
                    >
                        <ChartNoAxesColumnIcon />
                        <span className="text-xl tracking-tight text-foreground">
                            Rank Pilot
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl p-8">

                    {/* Heading */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl text-foreground">
                            Forgot Password
                        </h1>

                        <p className="text-muted-foreground text-sm mt-1">
                            Enter your email and we'll send you a reset link.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <label>
                            <div className="block text-sm text-foreground mb-1.5">
                                Email
                            </div>

                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />

                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="you@example.com"
                                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-muted/60 border border-border text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors text-sm"
                                />
                            </div>
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 py-3 rounded-lg bg-primary text-sm text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                            style={{ color: "var(--background)" }}
                        >
                            {loading ? (
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                            <ArrowLeft size={16} />
                            Back to Sign In
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}