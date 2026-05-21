import { Outlet } from "react-router-dom";

const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 font-sans text-slate-100">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25 mb-4">
                        <span className="font-extrabold text-white text-xl">C</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        CollabSphere
                    </h1>
                    <p className="mt-2 text-sm font-medium text-slate-500 uppercase tracking-widest">
                        Collaborative Workspace Platform
                    </p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                    {/* Decorative blurred blob */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;