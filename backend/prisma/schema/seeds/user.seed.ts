import bcrypt from 'bcrypt';
import { PrismaClient, Users } from "src/generated/prisma/client";

export async function seedUSers(prisma:PrismaClient) {
    const usersToCreate = [
        {
            email:'admin@jasrapo.com',
            password:'Admin123#',
        },
        {
            email:'secretary@jasrapo.com',
            password:'Secretary123#',
        },
        {
            email:'user@jasrapo.com',
            password:'User123#',
        },
        {
            email:'client@jasrapo.com',
            password:'Client123#',
        },
    ];
    
    const createdUsers:Users[] = [];

    for (const u of usersToCreate) {
        const hashedPassword = await bcrypt.hash(u.password, 10);

        const user = await prisma.users.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                password: hashedPassword,
            },
        });
        createdUsers.push(user);
    }

    console.log('✅ Usuarios creados correctamente.');

    return createdUsers;
}