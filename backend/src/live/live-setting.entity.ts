import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'live_settings' })
export class LiveSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', name: 'is_live', default: false })
  isLive: boolean;

  @Column({ type: 'varchar', length: 255, name: 'youtube_video_id', nullable: true })
  youtubeVideoId: string | null;

  @Column({ type: 'varchar', length: 255, name: 'youtube_playlist_id', nullable: true })
  youtubePlaylistId: string | null;

  @Column({ type: 'varchar', length: 255, name: 'youtube_channel_id', nullable: true })
  youtubeChannelId: string | null;

  @Column({ type: 'varchar', length: 255, name: 'bg_image', nullable: true })
  bgImage: string | null;

  @Column({ type: 'real', name: 'overlay_opacity', default: 0.5 })
  overlayOpacity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
