import { Outlet } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Logo from "@/public/logo.svg";
import "../services/metricsService";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <a href="/" className="flex items-center gap-2 font-bold text-xl">
                <img src={Logo} alt="logo" className="w-6 h-6" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DevPaste
                </span>
              </a>

              {/* <div className="flex items-center gap-4">
                <a
                  href="/recent"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Recent
                </a>
              </div> */}
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t py-8 mt-16 bg-white">
          <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
            <p>Built with ❤️ for developers</p>
          </div>
        </footer>

        <Toaster position="top-right" />
      </div>
    </QueryClientProvider>
  );
}