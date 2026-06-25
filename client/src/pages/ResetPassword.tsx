import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Loader2, Eye, EyeOff, CheckCircle2, ChartNoAxesColumnIcon } from "lucide-react";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { resetPassword } = useApp();

    const token = searchParams.get("token") || "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const validate = (): boolean => {
        const errs: string[] = [];
        if (password.length < 8) errs.push("At least 8 characters");
        if (!/[A-Z]/.test(password)) errs.push("One uppercase letter");
        if (!/[a-z]/.test(password)) errs.push("One lowercase letter");
        if (!/[0-9]/.test(password)) errs.push("One number");
        if (password !== confirmPassword) errs.push("Passwords do not match");
        setErrors(errs);
        return errs.length === 0;
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const result = await resetPassword(token, password);
        setLoading(false);

        if (result.success) {
            setSuccess(true);
            toast.success("Password reset successfully!");
        } else {
            toast.error(result.message);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-md text-center bg-card border border-border rounded-2xl p-8">
                    <h1 className="text-xl font-medium text-foreground mb-2">Invalid Reset Link</h1>
                    <p className="text-muted-foreground text-sm mb-6">No reset token provided. Please request a new password reset.</p>
                    <Link to="/forgot-password" className="text-primary hover:underline text-sm">
                        Request new reset link
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-md text-center bg-card border border-border rounded-2xl p-8">
                    <CheckCircle2 size={64} className="mx-auto text-success mb-4" />
                    <h1 className="text-2xl font-medium text-foreground mb-2">Password Reset!</h1>
                    <p className="text-muted-foreground text-sm mb-6">Your password has been updated successfully.</p>
                    <Link
                        to="/login"
                        className="inline-block px-6 py-3 rounded-lg bg-primary text-sm font-medium"
                        style={{ color: "var(--background)" }}
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="flex items-center justify-center gap-2 group">
                        <ChartNoAxesColumnIcon />
                        <span className="text-xl tracking-tight text-foreground">Rank Pilot</span>
                    </Link>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl text-foreground">Set New Password</h1>
                        <p className="text-muted-foreground text-sm mt-1">Create a strong password for your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <label>
                            <div className="block text-sm text-foreground mb-1.5">New Password</div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full pl-11 pr-11 py-3 rounded-lg bg-muted/60 border border-border text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </label>

                        <label>
                            <div className="block text-sm text-foreground mb-1.5">Confirm Password</div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-muted/60 border border-border text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 transition-colors text-sm"
                                />
                            </div>
                        </label>

                        {errors.length > 0 && (
                            <div className="bg-danger/5 border border-danger/20 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground mb-1">Password must include:</p>
                                <ul className="space-y-0.5">
                                    {["At least 8 characters", "One uppercase letter", "One lowercase letter", "One number", "Passwords do not match"].map((req) => (
                                        <li key={req} className={`text-xs flex items-center gap-1.5 ${errors.includes(req) ? "text-danger" : "text-success"}`}>
                                            {errors.includes(req) ? "✗" : "✓"} {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 py-3 rounded-lg bg-primary text-sm text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                            style={{ color: "var(--background)" }}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
