import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

const HomePage: React.FC = () => {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Dashboard UI now follows shadcn component patterns.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge>primary</Badge>
            <Badge variant="success">success</Badge>
            <Badge variant="warning">warning</Badge>
            <Badge variant="destructive">error</Badge>
            <Badge variant="secondary">secondary</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Ready for campaign operations with consistent UI primitives.</p>
        </CardContent>
      </Card>
    </section>
  );
};

export default HomePage;
