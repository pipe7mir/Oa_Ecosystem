import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const userRepo = app.get(getRepositoryToken(User));
    const existing = await userRepo.findOne({ where: { email: 'admin@oasis.com' } });

    if (!existing) {
        const user = userRepo.create({
            name: 'Admin Principal',
            username: 'admin',
            email: 'admin@oasis.com',
            password: await bcrypt.hash('oasis123', 10),
            role: 'admin',
            isApproved: true,
        });
        await userRepo.save(user);
        console.log('\n✅ Usuario administrador creado exitosamente:');
        console.log('-------------------------------------------');
        console.log('Email:    admin@oasis.com');
        console.log('Password: oasis123');
        console.log('-------------------------------------------\n');
    } else {
        console.log('\n⚠️ El usuario admin ya existe en la base de datos.');
    }

    await app.close();
}
bootstrap();
