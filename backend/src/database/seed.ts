/**
 * Seed script - creates mock data via backend's database connection
 * Run: cd backend && npx ts-node src/database/seed.ts
 */

import { QueryTypes } from 'sequelize';
import { sequelize, testDatabaseConnection } from './connection';

const PASSWORD_HASH = '5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa';

const users = [
  { email: 'john@company.com', name: 'John Smith' },
  { email: 'sarah@company.com', name: 'Sarah Johnson' },
  { email: 'mike@company.com', name: 'Mike Chen' },
  { email: 'lisa@company.com', name: 'Lisa Wang' },
  { email: 'tom@company.com', name: 'Tom Brown' },
];

const recipients = [
  { email: 'alice@shop.example.com', name: 'Alice Brown' },
  { email: 'bob@shop.example.com', name: 'Bob Wilson' },
  { email: 'carol@shop.example.com', name: 'Carol Davis' },
  { email: 'david@shop.example.com', name: 'David Miller' },
  { email: 'emma@shop.example.com', name: 'Emma Thompson' },
  { email: 'frank@shop.example.com', name: 'Frank Garcia' },
  { email: 'grace@shop.example.com', name: 'Grace Lee' },
  { email: 'henry@shop.example.com', name: 'Henry Kim' },
  { email: 'iris@shop.example.com', name: 'Iris Nguyen' },
  { email: 'jack@shop.example.com', name: 'Jack Parker' },
  { email: 'kate@shop.example.com', name: 'Kate Anderson' },
  { email: 'liam@shop.example.com', name: 'Liam Martinez' },
  { email: 'mona@shop.example.com', name: 'Mona Hassan' },
  { email: 'nick@shop.example.com', name: 'Nick Taylor' },
  { email: 'olivia@shop.example.com', name: 'Olivia Clark' },
  { email: 'paul@shop.example.com', name: 'Paul Robinson' },
  { email: 'quinn@shop.example.com', name: 'Quinn Lewis' },
  { email: 'rita@shop.example.com', name: 'Rita Hall' },
  { email: 'steve@shop.example.com', name: 'Steve Young' },
  { email: 'uma@shop.example.com', name: 'Uma Patel' },
];

interface CampaignDef {
  name: string;
  subject: string;
  body: string;
  status: 'draft' | 'sending' | 'scheduled' | 'sent';
  scheduledAt?: Date | null;
  recipientIndices: number[]; // indices into recipients array
  sentCount?: number;
  failedCount?: number;
  openedCount?: number;
}

const campaigns: CampaignDef[] = [
  { name: 'New Year 2025 Collection', subject: 'New 2025 Products', body: 'Hi {{name}}, welcome the new year with an exclusive collection from the Shop! Offers up to 40% for VIP customers.', status: 'draft', recipientIndices: [] },
  { name: 'Flash Sale Weekend', subject: 'Weekend Flash Sale!', body: 'Hi {{name}}, only 48 hours! 50% off all products. Code: FLASH50', status: 'draft', recipientIndices: [] },
  { name: 'Summer Sale 2024', subject: 'Summer Sale - 30% Off!', body: 'Hi {{name}}, Summer Sale is here! Get 30% off all products now. Deadline: 06/30/2024', status: 'scheduled', scheduledAt: new Date('2025-06-25T09:00:00Z'), recipientIndices: [0, 1, 2, 3, 4] },
  { name: 'Monthly Newsletter #6', subject: 'June 2025 Newsletter', body: 'Hi {{name}}, June news update: 3 new features have launched!', status: 'scheduled', scheduledAt: new Date('2025-06-01T08:00:00Z'), recipientIndices: [5, 6, 7] },
  { name: 'Spring Newsletter', subject: 'March Newsletter', body: 'Hi {{name}}, March news update: 5 new features have launched!', status: 'sent', recipientIndices: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], sentCount: 13, failedCount: 2, openedCount: 8 },
  { name: "Women's Day Promotion", subject: "International Women's Day Offer", body: 'Hi {{name}}, happy March 8th! 20% off all orders for women.', status: 'sent', recipientIndices: Array.from({length:20}, (_,i)=>i), sentCount: 20, failedCount: 0, openedCount: 15 },
  { name: 'Product Launch - Series X', subject: 'Official Launch of Series X', body: 'Hi {{name}}, Series X has officially launched! Order today to receive a special offer.', status: 'sent', recipientIndices: [0,1,2,3,4,5,6,7,8,9], sentCount: 9, failedCount: 1, openedCount: 6 },
  { name: 'Anniversary Sale', subject: '5th Anniversary - 25% Off', body: 'Hi {{name}}, the Shop turns 5 years old! Thank you for being with us. 25% off all products.', status: 'sent', recipientIndices: Array.from({length:18}, (_,i)=>i), sentCount: 16, failedCount: 2, openedCount: 10 },
  { name: 'Cyber Monday Deal', subject: 'Cyber Monday - Up to 70% Off', body: 'Hi {{name}}, Cyber Monday is back! Up to 70% off thousands of products. Today only!', status: 'sent', recipientIndices: [0,1,2,3,4,5,6,7,8,9,10,11], sentCount: 11, failedCount: 1, openedCount: 7 },
  { name: 'VIP Exclusive Offer', subject: 'Special Exclusive Offer for VIPs', body: 'Hi {{name}}, thank you for being a VIP customer! Here is your special offer code: VIPOFF50', status: 'sent', recipientIndices: [0,1,2,3,4,5,6,7], sentCount: 8, failedCount: 0, openedCount: 8 },
];

// Helper wrapper to run SELECT queries and return typed rows
async function runSelect<T = Record<string, unknown>>(sql: string, replacements?: Record<string, unknown>): Promise<T[]> {
  const rows = (await sequelize.query<T>(sql, { replacements, type: QueryTypes.SELECT })) as T[];
  return rows ?? [];
}

async function truncateTables(): Promise<void> {
  console.log('🗑️  Truncating existing data...');
  await sequelize.query('TRUNCATE campaign_recipients, campaigns, recipients, refresh_tokens, users CASCADE');
}

async function createUsers(): Promise<string[]> {
  console.log('👥 Creating users...');
  const userIds: string[] = [];

  for (const user of users) {
    const existing = await runSelect<{ id: string }>(`SELECT id FROM users WHERE email = :email`, { email: user.email });

    if (existing.length > 0) {
      userIds.push(existing[0].id);
      console.log(`   ✓ ${user.email} (existing)`);
      continue;
    }

    const inserted = await runSelect<{ id: string }>(
      `INSERT INTO users (email, name, password_hash) VALUES (:email, :name, :passwordHash) RETURNING id`,
      { email: user.email, name: user.name, passwordHash: PASSWORD_HASH }
    );

    if (inserted.length === 0) throw new Error(`Failed to insert user ${user.email}`);

    userIds.push(inserted[0].id);
    console.log(`   ✓ ${user.email} (created)`);
  }

  return userIds;
}

async function createRecipients(): Promise<string[]> {
  console.log('📧 Creating recipients...');
  const recipientIds: string[] = [];

  for (const recipient of recipients) {
    const existing = await runSelect<{ id: string }>(`SELECT id FROM recipients WHERE email = :email`, { email: recipient.email });

    if (existing.length > 0) {
      recipientIds.push(existing[0].id);
      console.log(`   ✓ ${recipient.email} (existing)`);
      continue;
    }

    const inserted = await runSelect<{ id: string }>(
      `INSERT INTO recipients (email, name) VALUES (:email, :name) RETURNING id`,
      { email: recipient.email, name: recipient.name }
    );

    if (inserted.length === 0) throw new Error(`Failed to insert recipient ${recipient.email}`);

    recipientIds.push(inserted[0].id);
    console.log(`   ✓ ${recipient.email} (created)`);
  }

  return recipientIds;
}

async function createCampaigns(userId: string, recipientIds: string[]): Promise<string[]> {
  console.log('📮 Creating campaigns...');
  const campaignIds: string[] = [];

  for (const campaign of campaigns) {
    const existing = await runSelect<{ id: string }>(`SELECT id FROM campaigns WHERE name = :name AND created_by = :userId`, { name: campaign.name, userId });

    let campaignId: string;

    if (existing.length > 0) {
      campaignId = existing[0].id;
      console.log(`   ✓ ${campaign.name} (existing)`);
      // clean attachments
      await sequelize.query(`DELETE FROM campaign_recipients WHERE campaign_id = :campaignId`, { replacements: { campaignId } });
    } else {
      const inserted = await runSelect<{ id: string }>(
        `INSERT INTO campaigns (name, subject, body, status, scheduled_at, created_by) VALUES (:name, :subject, :body, :status, :scheduledAt, :createdBy) RETURNING id`,
        { name: campaign.name, subject: campaign.subject, body: campaign.body, status: campaign.status, scheduledAt: campaign.scheduledAt ?? null, createdBy: userId }
      );

      if (inserted.length === 0) throw new Error(`Failed to insert campaign ${campaign.name}`);

      campaignId = inserted[0].id;
      console.log(`   ✓ ${campaign.name} (created)`);
    }

    campaignIds.push(campaignId);

    if (campaign.recipientIndices.length === 0) continue;

    const targetRecipientIds = campaign.recipientIndices.map((i) => {
      const id = recipientIds[i];
      if (!id) throw new Error(`Recipient index ${i} out of range`);
      return id;
    });

    // Bulk insert attachments using parameterized query
    const placeholders = targetRecipientIds.map((_, i) => `(:campaignId, :r${i})`).join(', ');
    const replacements: Record<string, unknown> = { campaignId };
    targetRecipientIds.forEach((rid, i) => (replacements[`r${i}`] = rid));

    await sequelize.query(`INSERT INTO campaign_recipients (campaign_id, recipient_id) VALUES ${placeholders}`, { replacements });

    // If campaign is 'sent' - mark statuses
    if (campaign.status === 'sent' && typeof campaign.sentCount === 'number') {
      const sentIds = targetRecipientIds.slice(0, campaign.sentCount);
      const failedIds = targetRecipientIds.slice(campaign.sentCount, campaign.sentCount + (campaign.failedCount ?? 0));
      const openedIds = sentIds.slice(0, campaign.openedCount ?? 0);

      if (sentIds.length > 0) {
        const inPlaceholders = sentIds.map((_, i) => `:s${i}`).join(', ');
        const rep: Record<string, unknown> = { campaignId };
        sentIds.forEach((id, i) => (rep[`s${i}`] = id));
        await sequelize.query(
          `UPDATE campaign_recipients SET status = 'sent', sent_at = NOW() - INTERVAL '1 day' WHERE campaign_id = :campaignId AND recipient_id IN (${inPlaceholders})`,
          { replacements: rep }
        );
      }

      if (failedIds.length > 0) {
        const inPlaceholders = failedIds.map((_, i) => `:f${i}`).join(', ');
        const rep: Record<string, unknown> = { campaignId };
        failedIds.forEach((id, i) => (rep[`f${i}`] = id));
        await sequelize.query(
          `UPDATE campaign_recipients SET status = 'failed' WHERE campaign_id = :campaignId AND recipient_id IN (${inPlaceholders})`,
          { replacements: rep }
        );
      }

      if (openedIds.length > 0) {
        const inPlaceholders = openedIds.map((_, i) => `:o${i}`).join(', ');
        const rep: Record<string, unknown> = { campaignId };
        openedIds.forEach((id, i) => (rep[`o${i}`] = id));
        await sequelize.query(
          `UPDATE campaign_recipients SET opened_at = NOW() - INTERVAL '12 hours' WHERE campaign_id = :campaignId AND recipient_id IN (${inPlaceholders})`,
          { replacements: rep }
        );
      }
    }
  }

  return campaignIds;
}

async function verifyData(): Promise<void> {
  console.log('\n📊 Verifying campaign stats...\n');

  const stats = await runSelect<Record<string, unknown>>(`
    SELECT
      c.name,
      c.status,
      COUNT(cr.recipient_id) AS total,
      COUNT(cr.recipient_id) FILTER (WHERE cr.status = 'sent') AS sent,
      COUNT(cr.recipient_id) FILTER (WHERE cr.status = 'failed') AS failed,
      COUNT(cr.recipient_id) FILTER (WHERE cr.opened_at IS NOT NULL) AS opened
    FROM campaigns c
    LEFT JOIN campaign_recipients cr ON cr.campaign_id = c.id
    GROUP BY c.id, c.name, c.status
    ORDER BY c.created_at ASC
  `);

  console.log('| Campaign | Status | Total | Sent | Failed | Opened |');
  console.log('|----------|--------|-------|------|--------|--------|');

  for (const row of stats) {
    const name = String(row.name ?? '').padEnd(30);
    const status = String(row.status ?? '').padEnd(7);
    const total = String(row.total ?? '0').padStart(5);
    const sent = String(row.sent ?? '0').padStart(4);
    const failed = String(row.failed ?? '0').padStart(6);
    const opened = String(row.opened ?? '0').padStart(6);
    console.log(`| ${name} | ${status} | ${total} | ${sent} | ${failed} | ${opened} |`);
  }
}

async function seed(): Promise<void> {
  try {
    console.log('🌱 Starting seed process...\n');

    const connected = await testDatabaseConnection();
    if (!connected) {
      console.error('❌ Cannot connect to database. Please check your connection settings.');
      process.exit(1);
    }

    await truncateTables();
    const userId = (await createUsers())[0]; // Use first user as creator
    const recipientIds = await createRecipients();
    await createCampaigns(userId, recipientIds);
    await verifyData();

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();