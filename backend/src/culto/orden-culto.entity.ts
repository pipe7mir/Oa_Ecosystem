import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'orden_culto' })
export class OrdenCulto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  actividad: string;

  @Column({ type: 'varchar', length: 255 })
  responsable: string;

  @Column({ type: 'time' })
  hora: string;

  @Column({ type: 'date', nullable: true })
  fecha: string;

  @Column({ type: 'int', default: 5 })
  duracionEstimada: number; // en minutos

  @Column({ type: 'int', default: 1 })
  cantidadPersonas: number;

  @Column({ type: 'text', nullable: true })
  participantes: string;

  @Column({ type: 'boolean', default: false })
  esGrupoEspecial: boolean;

  @Column({ type: 'boolean', default: false })
  necesitaPianista: boolean;

  @Column({ type: 'boolean', default: false })
  completado: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
