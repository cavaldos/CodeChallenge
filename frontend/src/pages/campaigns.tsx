import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { useCampaigns, type Campaign, type CampaignStatus } from '~/services/campaign.service';

const statusStyles: Record<CampaignStatus, { label: string; variant: 'muted' | 'secondary' | 'warning' | 'success' }> = {
  draft: { label: 'Draft', variant: 'muted' },
  scheduled: { label: 'Scheduled', variant: 'secondary' },
  sending: { label: 'Sending', variant: 'warning' },
  sent: { label: 'Sent', variant: 'success' },
};

const CampaignsPage = () => {
  const navigate = useNavigate();
  const { data, error, isLoading } = useCampaigns();

  const campaigns = data?.data ?? [];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Campaigns</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track performance and manage lifecycle in one place.</p>
        </div>
        <Button onClick={() => navigate('/campaigns/new')}>
          <Plus className="size-4" />
          New campaign
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={`campaigns-skeleton-${index}`} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load campaigns</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No campaigns yet</CardTitle>
            <CardDescription>Create your first email campaign to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/campaigns/new')}>Create campaign</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>All campaigns</CardTitle>
            <CardDescription>{campaigns.length} total campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign: Campaign) => {
                  const status = statusStyles[campaign.status];
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell className="text-muted-foreground">{campaign.subject}</TableCell>
                      <TableCell>{campaign.stats?.total ?? 0}</TableCell>
                      <TableCell>{campaign.stats?.opened ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                          View details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default CampaignsPage;
