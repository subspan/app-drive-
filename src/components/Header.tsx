import { useRouter } from 'next/router';
import Logo from './Logo';
import CartIcon from './CartIcon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Header = () => {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="w-full border-b border-border">
      <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="cursor-pointer flex items-center" onClick={() => router.push("/")}>
          <Logo />
        </div>
        
        <div className="hidden md:flex space-x-6">
          <Button variant="ghost" onClick={() => router.push("/")}>Home</Button>
          <Button variant="ghost" onClick={() => router.push("/shops")}>Shops</Button>
          {user && <Button variant="ghost" onClick={() => router.push("/orders")}>Orders</Button>}
          {!user && <Button variant="ghost" onClick={() => router.push("/become-driver")}>Become a Driver</Button>}
        </div>
        
        <div className="flex items-center space-x-4">
          <CartIcon />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src="" />
                  <AvatarFallback>{profile?.full_name ? getInitials(profile.full_name) : 'U'}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/orders')}>Orders</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/cart')}>Cart</DropdownMenuItem>
                {!profile?.is_age_verified && (
                  <DropdownMenuItem onClick={() => router.push('/age-verification')}>Verify Age</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" onClick={() => router.push("/login")}>Login</Button>
              <Button variant="default" onClick={() => router.push("/signup")}>Sign Up</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;