import { CalendarClock, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Skeleton } from '~/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import {
  deleteCampaign,
  scheduleCampaign,
  sendCampaign,
  useCampaign,
  useCampaignStats,
  type CampaignStatus,
} from '~/services/campaign.service';

const statusStyles: Record<CampaignStatus, { label: string; variant: 'muted' | 'secondary' | 'warning' | 'success' }> = {
  draft: { label: 'Draft', variant: 'muted' },
  scheduled: { label: 'Scheduled', variant: 'secondary' },
  sending: { label: 'Sending', variant: 'warning' },
  sent: { label: 'Sent', variant: 'success' },
};

const recipientStatusVariant: Record<string, 'muted' | 'warning' | 'success' | 'destructive'> = {
  pending: 'muted',
  sent: 'success',
  failed: 'destructive',
  sending: 'warning',
};

const CampaignDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const campaignId = id ?? '';

  const { data: campaign, error: campaignError, isLoading, mutate } = useCampaign(campaignId);
  const { data: stats } = useCampaignStats(campaignId);

  const handleSchedule = async () => {
    if (!campaignId) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await scheduleCampaign(campaignId, { scheduledAt });
      await mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to schedule campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSend = async () => {
    if (!campaignId) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await sendCampaign(campaignId);
      await mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!campaignId) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await deleteCampaign(campaignId);
      navigate('/campaigns');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </section>
    );
  }

  if (campaignError || !campaign) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Campaign not found</AlertTitle>
          <AlertDescription>{campaignError?.message ?? 'Unable to load campaign.'}</AlertDescription>
        </Alert>
      </section>
    );
  }

  const status = statusStyles[campaign.status];
  const statsSummary = stats ?? campaign.stats;
  const openRate = Math.max(0, Math.min(100, (stats?.open_rate ?? 0) * 100));
  const sendRate = Math.max(0, Math.min(100, (stats?.send_rate ?? 0) * 100));

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{campaign.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{campaign.subject}</p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Message preview</CardTitle>
            <CardDescription>Review the campaign body before sending.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{campaign.body}</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Schedule or send based on status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {campaign.status === 'draft' ? (
              <>
                <Button className="w-full" onClick={handleSchedule} disabled={isSubmitting}>
                  <CalendarClock className="size-4" />
                  Schedule
                </Button>
                <Button variant="secondary" className="w-full" onClick={handleSend} disabled={isSubmitting}>
                  <Send className="size-4" />
                  Send now
                </Button>
                <Button variant="destructive" className="w-full" onClick={handleDelete} disabled={isSubmitting}>
                  <Trash2 className="size-4" />
                  Delete draft
                </Button>
              </>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Action locked
              </Button>
            )}

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Action failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Stats</CardTitle>
            <CardDescription>Engagement and delivery overview.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Recipients</p>
                <p className="text-xl font-semibold">{statsSummary?.total ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Opened</p>
                <p className="text-xl font-semibold">{statsSummary?.opened ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sent</p>
                <p className="text-xl font-semibold">{statsSummary?.sent ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Failed</p>
                <p className="text-xl font-semibold">{statsSummary?.failed ?? 0}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Open rate</span>
                  <span>{Math.round(openRate)}%</span>
                </div>
                <Progress value={openRate} />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Send rate</span>
                  <span>{Math.round(sendRate)}%</span>
                </div>
                <Progress value={sendRate} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Recipients</CardTitle>
            <CardDescription>Delivery status by recipient.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaign.recipients.map(recipient => (
                  <TableRow key={recipient.id}>
                    <TableCell className="font-medium">{recipient.name}</TableCell>
                    <TableCell className="text-muted-foreground">{recipient.email}</TableCell>
                    <TableCell>
                      <Badge variant={recipientStatusVariant[recipient.status] ?? 'muted'}>{recipient.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CampaignDetailPage;
