
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Menu, User, LogIn, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" },
  { name: "Editor", path: "/editor" },
];

export function Navbar() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Get user initials for the avatar fallback
  const getUserInitials = () => {
    if (!user) return "?";
    return user.username.substring(0, 2).toUpperCase();
  };

  // Handle user logout
  const handleLogout = () => {
    logout();
    setOpen(false); // Close mobile menu if open
  };

  // Navigate to profile page
  const goToProfile = () => {
    navigate('/profile');
    setOpen(false); // Close mobile menu if open
  };

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
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {/* Show Login/Register buttons for unauthenticated users */}
              {!isAuthenticated && (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/login">
                      <LogIn className="mr-2 h-4 w-4" /> Sign In
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </div>
              )}

              {/* Show user dropdown for authenticated users */}
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profilePictureUrl} alt={user?.username} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium">{user?.username}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={goToProfile}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )}
        
        {/* Mobile Navigation */}
        {isMobile && (
          <div className="flex-1 flex justify-end items-center space-x-4">
            <ThemeToggle />
            
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
                  
                  {/* Authentication Links for Mobile */}
                  {!isAuthenticated ? (
                    <>
                      <Link 
                        to="/login" 
                        className="text-sm font-medium transition-colors hover:text-primary flex items-center"
                        onClick={() => setOpen(false)}
                      >
                        <LogIn className="mr-2 h-4 w-4" /> Sign In
                      </Link>
                      <Link 
                        to="/register" 
                        className="text-sm font-medium transition-colors hover:text-primary"
                        onClick={() => setOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="pt-2 flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={user?.profilePictureUrl} alt={user?.username} />
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user?.username}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <Link 
                        to="/profile" 
                        className="text-sm font-medium transition-colors hover:text-primary flex items-center"
                        onClick={() => setOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" /> Profile
                      </Link>
                      <Button 
                        variant="outline" 
                        className="mt-2 flex items-center justify-center"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Log out
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </nav>
  );
}
