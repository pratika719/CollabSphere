import React from "react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("[ErrorBoundary caught an error]:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onReset) {
            this.props.onReset();
        } else {
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex h-full w-full min-h-[350px] items-center justify-center p-8 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md shadow-2xl relative overflow-hidden">
                    {/* Glowing effect inside card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="max-w-md text-center space-y-5 relative z-[1]">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white tracking-tight">Section Load Failed</h3>
                            <p className="text-slate-400 text-[13px] leading-relaxed max-w-sm mx-auto">
                                An unexpected error occurred while loading this section of the screen. You can try refreshing or returning to the dashboard.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={this.handleReset}
                                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-semibold shadow-lg shadow-purple-500/20 active:scale-[0.98] transition cursor-pointer"
                            >
                                Try Again
                            </button>
                            <a
                                href="/dashboard"
                                className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-slate-800 hover:bg-white/[0.08] text-slate-200 text-[13px] font-semibold active:scale-[0.98] transition"
                            >
                                Go to Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
