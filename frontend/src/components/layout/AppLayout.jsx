import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";

/*
|--------------------------------------------------------------------------
| APP LAYOUT
|--------------------------------------------------------------------------
|
| Root layout for all authenticated routes.
|
| Architecture:
| ┌─────────────┬────────────────────────────────────┐
| │             │  Navbar (breadcrumbs + search)      │
| │  Sidebar    ├────────────────────────────────────┤
| │  (fixed)    │  <Outlet /> (page content)         │
| │             │                                     │
| └─────────────┴────────────────────────────────────┘
|
| WHY separate components?
| - Sidebar owns navigation, workspace switching, and profile
| - Navbar owns breadcrumbs, search, and notifications
| - AppLayout only orchestrates the grid — single responsibility
|
*/

export default function AppLayout() {
    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden w-full">
            {/* Sidebar — fixed left navigation */}
            < Sidebar />

            {/* Right panel: Navbar + main content */}
            < div className="flex-1 flex flex-col min-w-0" >
                <Navbar />

                {/* Main scrollable content area */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    {/* Decorative gradient orbs for depth */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/[0.02] rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-500/[0.02] rounded-full blur-3xl pointer-events-none" />

                    <div className="max-w-7xl mx-auto relative z-[1]">
                        <Outlet />
                    </div>
                </main>
            </div >
        </div >
    );
}
