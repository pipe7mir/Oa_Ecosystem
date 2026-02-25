import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Usamos el nombre 'example_users' en la base de datos para evitar colisiones
// si ya tienes otra entidad User en tu proyecto.
@Entity('example_users')
export class ExampleUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;
}
