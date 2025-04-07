import { useRouter } from 'next/router';
import Logo from './Logo';
import { Button } from '@/components/ui/button';

const Header = () => {
  const router = useRouter();

  return (
    <div className="w-full border-b border-border">
      <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="cursor-pointer flex items-center" onClick={() => router.push("/")}>
          <Logo />
        </div>
        
        <div className="hidden md:flex space-x-6">
          <Button variant="ghost" onClick={() => router.push("/")}>Home</Button>
          <Button variant="ghost" onClick={() => router.push("/shops")}>Shops</Button>
          <Button variant="ghost" onClick={() => router.push("/orders")}>Orders</Button>
          <Button variant="ghost" onClick={() => router.push("/become-driver")}>Become a Driver</Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push("/login")}>Login</Button>
          <Button variant="default" onClick={() => router.push("/signup")}>Sign Up</Button>
        </div>
      </div>
    </div>
  );
};

export default Header;