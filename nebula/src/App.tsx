import { Link, Route, Routes } from "react-router";
import Objekts from "./pages/ObjektsPage.tsx";
import ObjektsByOwner from "./pages/OwnerPage.tsx";
import { ModeToggle } from "@/components/ui/mode-toggle.tsx";
import { ThemeProvider } from "@/components/ui/theme-provider.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { Icon } from "@iconify/react";

function App() {
  return (
    <div>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <nav className="flex justify-between items-center border-b border-indigo-400/40 bg-linear-to-r/increasing from-indigo-400/30 via-teal-400/40 to-purple-400/30 backdrop-blur-lg p-3 shadow-lg fixed top-0 left-0 right-0 z-50">
            <h1 className="text-3xl ml-3 font-bold">Nebula</h1>
            <div className="flex space-x-10">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/">
                    <Icon icon="streamline:cards" width={30} height={30} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={5}>
                  <p>Objekts</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/by-owner">
                    <Icon
                      icon="streamline:search-visual"
                      width={30}
                      height={30}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={5}>
                  <p>Owner</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="w-32" />
            <ModeToggle />
          </nav>
          <div className="pt-20">
            <Routes>
              <Route path="/" element={<Objekts />} />
              <Route path="/by-owner" element={<ObjektsByOwner />} />
            </Routes>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
