
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, Settings, Key, UserX } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, changePassword, deactivateAccount } = useAuth();
  const navigate = useNavigate();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeactivatingAccount, setIsDeactivatingAccount] = useState(false);
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, user]);

  if (!user) {
    return <div className="container mx-auto py-8 text-center">Loading profile...</div>;
  }

  // Get user initials for the avatar fallback
  const getUserInitials = () => {
    return user.username.substring(0, 2).toUpperCase();
  };

  // Format date for display
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        {/* Profile Overview Card */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profilePictureUrl} alt={user.username} />
              <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center sm:text-left">
              <CardTitle className="text-2xl">{user.username}</CardTitle>
              <CardDescription className="text-lg">{user.email}</CardDescription>
              <p className="text-sm text-muted-foreground">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Bio</h3>
              <p className="mt-1">{user.bio || 'No bio yet.'}</p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <ProfileEditDialog user={user} />
            <ChangePasswordDialog userId={user.id} changePassword={changePassword} />
            <DeactivateAccountDialog userId={user.id} deactivateAccount={deactivateAccount} username={user.username} />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// Profile Edit Dialog Component
const profileSchema = z.object({
  bio: z.string().max(500, { message: 'Bio cannot exceed 500 characters' }),
  profilePictureUrl: z.string().url({ message: 'Please enter a valid URL' }).or(z.string().length(0)),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileEditDialog = ({ user }: { user: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: user.bio || '',
      profilePictureUrl: user.profilePictureUrl || '',
    },
  });
  
  // Mock function to update profile
  const updateProfile = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    // We would call the backend here
    console.log('Updating profile with:', values);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(updateProfile)} className="space-y-4">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us a little about yourself" 
                      className="resize-none h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="profilePictureUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/your-image.jpg" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Change Password Dialog Component
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const ChangePasswordDialog = ({ 
  userId, 
  changePassword 
}: { 
  userId: string; 
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });
  
  const onSubmit = async (values: PasswordFormValues) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const success = await changePassword(
        userId,
        values.currentPassword,
        values.newPassword
      );
      
      if (success) {
        setIsOpen(false);
        form.reset();
      } else {
        setError('Failed to change password. Please check your current password.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Key className="mr-2 h-4 w-4" /> Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Update your password here. You'll need to enter your current password first.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Deactivate Account Dialog Component
const DeactivateAccountDialog = ({ 
  userId, 
  deactivateAccount,
  username
}: { 
  userId: string;
  deactivateAccount: (userId: string) => Promise<boolean>;
  username: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  
  const handleDeactivate = async () => {
    if (confirmText !== username) {
      setError(`Please type "${username}" to confirm`);
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const success = await deactivateAccount(userId);
      
      if (success) {
        setIsOpen(false);
      } else {
        setError('Failed to deactivate account. Please try again later.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <UserX className="mr-2 h-4 w-4" /> Deactivate Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deactivate Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently deactivate your account and remove your data.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <p>To confirm, type your username: <strong>{username}</strong></p>
          <Input 
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`Type "${username}" to confirm`}
          />
        </div>
        
        <DialogFooter className="mt-4">
          <Button
            type="button" 
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button" 
            variant="destructive"
            onClick={handleDeactivate}
            disabled={isSubmitting || confirmText !== username}
          >
            {isSubmitting ? 'Processing...' : 'Deactivate Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePage;
