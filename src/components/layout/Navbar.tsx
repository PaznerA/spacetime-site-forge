
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" },
  { name: "Editor", path: "/editor" },
];

export function Navbar() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold">SpaceTime Site Forge</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <ThemeToggle />
          </div>
        )}
        
        {/* Mobile Navigation */}
        {isMobile && (
          <div className="flex-1 flex justify-end">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col py-4 space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="flex justify-center pt-4">
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </nav>
  );
}
