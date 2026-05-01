import { MailPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { createCampaign } from '~/services/campaign.service';
import { createRecipient, useRecipients } from '~/services/recipient.service';

const CampaignNewPage = () => {
  const navigate = useNavigate();
  const { data, error: recipientError, isLoading: isRecipientsLoading, mutate } = useRecipients();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingRecipients = data?.data ?? [];

  const parsedEmails = useMemo(() => {
    return recipientEmails
      .split(/[\n,]/)
      .map(email => email.trim())
      .filter(Boolean);
  }, [recipientEmails]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const recipientIds: string[] = [];

      for (const email of parsedEmails) {
        const match = existingRecipients.find(recipient => recipient.email === email);
        if (match) {
          recipientIds.push(match.id);
          continue;
        }

        const namePart = email.split('@')[0] ?? 'Recipient';
        const createdRecipient = await createRecipient({ email, name: namePart });
        recipientIds.push(createdRecipient.id);
      }

      await createCampaign({ name, subject, body, recipient_ids: recipientIds });
      await mutate();
      navigate('/campaigns');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Create campaign</h2>
        <p className="mt-1 text-sm text-muted-foreground">Draft a message and pick recipients in minutes.</p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Campaign details</CardTitle>
          <CardDescription>Fill in the essentials and add recipients to send.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="grid gap-2">
              <Label htmlFor="name">Campaign name</Label>
              <Input
                id="name"
                placeholder="April newsletter"
                value={name}
                onChange={event => setName(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject line</Label>
              <Input
                id="subject"
                placeholder="Your monthly product updates"
                value={subject}
                onChange={event => setSubject(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="body">Email body</Label>
              <Textarea
                id="body"
                rows={6}
                placeholder="Write the email content..."
                value={body}
                onChange={event => setBody(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="recipients">Recipients (comma or newline separated)</Label>
                <Badge variant="outline">{parsedEmails.length} queued</Badge>
              </div>
              <Textarea
                id="recipients"
                rows={4}
                placeholder="jane@company.com\nlee@company.com"
                value={recipientEmails}
                onChange={event => setRecipientEmails(event.target.value)}
              />
              {isRecipientsLoading ? (
                <p className="text-xs text-muted-foreground">Loading recipients...</p>
              ) : recipientError ? (
                <p className="text-xs text-destructive">{recipientError.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">{existingRecipients.length} existing recipients found.</p>
              )}
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Unable to create campaign</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={isSubmitting}>
                <MailPlus className="size-4" />
                {isSubmitting ? 'Creating...' : 'Create campaign'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/campaigns')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default CampaignNewPage;
