import { Link, Route, Routes } from 'react-router';
import Objekts from './Objekts.tsx';
import ObjektsByOwner from './ObjektsByOwner';
import { ModeToggle } from '@/components/ui/mode-toggle.tsx';
import { ThemeProvider } from '@/components/ui/theme-provider.tsx';
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
          <nav className='flex justify-between items-center bg-blue-950/30 backdrop-blur-lg p-5 shadow-lg fixed top-0 left-0 right-0 z-50'>
            <h1 className="text-4xl font-bold">Nebula</h1>
              <div className="flex space-x-10">
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/">
                      <Icon icon="streamline:cards" width={40} height={40} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side='bottom' sideOffset={5}>
                    <p>Objekts</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/by-owner">
                      <Icon icon="streamline:search-visual" width={40} height={40} />         
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side='bottom' sideOffset={5}>
                    <p>Owner</p>
                  </TooltipContent>
                </Tooltip>

              </div>
            <div className="w-32" />
            <ModeToggle />
          </nav>
          <div className='pt-20'>
            <Routes>
              <Route path="/" element={<Objekts />} />
              <Route path="/by-owner" element={<ObjektsByOwner />} />
            </Routes>
          </div>
        </TooltipProvider>
      </ThemeProvider>
      
    </div>
  )
}

export default App;