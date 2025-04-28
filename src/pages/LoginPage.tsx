
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, LogIn } from 'lucide-react';

// Define form validation schema
const loginFormSchema = z.object({
  usernameOrEmail: z.string()
    .min(3, { message: 'Please enter a valid username or email' }),
  password: z.string()
    .min(1, { message: 'Password is required' }),
});

// Define the form values type
type LoginFormValues = z.infer<typeof loginFormSchema>;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize the form with react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const success = await login(
        values.usernameOrEmail,
        values.password
      );

      if (success) {
        navigate('/');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="usernameOrEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username or Email</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe or john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2">⟳</span> Signing In...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="w-full text-center">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>
          <div className="w-full text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
