import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { Announcement } from './announcements/announcement.entity';
import { RequestEntity } from './requests/request.entity';
import { Setting } from './settings-module/setting.entity';
import { BoardMember } from './management/board-member.entity';
import { GalleryItem } from './management/gallery-item.entity';
import { ResourceEntity } from './resources-module/resource.entity';
import { Billboard } from './billboards/billboard.entity';
import { EventForm } from './event-forms-module/event-form.entity';
import { FormSubmission } from './event-forms-module/form-submission.entity';
import { LiveSetting } from './live/live-setting.entity';
import { EmailModule } from './email/email.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { RequestsModule } from './requests/requests.module';
import { ManagementModule } from './management/management.module';
import { ResourcesModule } from './resources-module/resources.module';
import { BillboardsModule } from './billboards/billboards.module';
import { EventFormsModule } from './event-forms-module/event-forms.module';
import { LiveModule } from './live/live.module';
import { SettingsModule } from './settings-module/settings.module';
import { PresentationsModule } from './presentations/presentations.module';
import { TestCorsController } from './common/test-cors.controller';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const dbUrl = process.env.DATABASE_URL;

        // Log database configuration for debugging
        console.log('📦 Database Configuration:');
        console.log('  DATABASE_URL exists:', !!dbUrl);
        console.log('  NODE_ENV:', process.env.NODE_ENV);

        if (!dbUrl) {
          console.error('❌ DATABASE_URL not configured! Set it in environment variables.');
          throw new Error('DATABASE_URL environment variable is required');
        }

        console.log('  ✅ Using PostgreSQL (Neon)');
        return {
          type: 'postgres',
          url: dbUrl,
          autoLoadEntities: true,
          synchronize: true,
          ssl: { rejectUnauthorized: false },
          // Connection pool settings for Neon
          extra: {
            connectionTimeoutMillis: 30000,
            idleTimeoutMillis: 30000,
            max: 10,
          },
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    AnnouncementsModule,
    WhatsappModule,
    RequestsModule,
    ManagementModule,
    ResourcesModule,
    BillboardsModule,
    EventFormsModule,
    LiveModule,
    SettingsModule,
    PresentationsModule,
    EmailModule,
  ],
  controllers: [TestCorsController, HealthController],
})
export class AppModule { }
