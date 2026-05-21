import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routesConfig } from "../routes/routes.jsx";

const router = createBrowserRouter(routesConfig);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}