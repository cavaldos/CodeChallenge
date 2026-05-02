import { LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { login, register } from '~/services/user.service';
import { mutateAuth } from '~/services/auth';

type AuthMode = 'login' | 'register';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        await register({ email, password, name });
        setNotice('Account created successfully. Please sign in.');
        setMode('login');
        setPassword('');
        return;
      }

      await login({ email, password });
      await mutateAuth();
      navigate('/campaigns', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md border shadow-sm" size="sm">
        <CardHeader>
          <CardTitle>Mini Campaign Manager</CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Sign in to continue managing campaigns.' : 'Create an account to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">

          <form className="space-y-4" onSubmit={onSubmit}>
            {mode === 'register' ? (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="******"
                minLength={mode === 'register' ? 6 : 1}
                required
              />
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Authentication error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {notice ? (
              <Alert>
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{notice}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full mt-1" disabled={isSubmitting}>
              {mode === 'login' ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
              {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={mode === 'login' ? 'default' : 'outline'}
              onClick={() => {
                navigate('/login');
                setMode('login');
                setError(null);
                setNotice(null);
              }}
            >
              <LogIn className="size-4" />
              Login
            </Button>
            <Button
              type="button"
              variant={mode === 'register' ? 'default' : 'outline'}
              onClick={() => {
                setMode('register');
                setError(null);
                setNotice(null);
              }}
            >
              <UserPlus className="size-4" />
              Register
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
