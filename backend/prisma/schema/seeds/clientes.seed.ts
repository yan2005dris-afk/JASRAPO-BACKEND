import { Clientes, PrismaClient } from "src/generated/prisma/client";

export async function seedClientes(prisma: PrismaClient) {
    const clientes: Awaited<ReturnType<typeof prisma.clientes.findUnique>>[] = [];
    
    // Clientes originales
    const clientesBase = [
        { clienteId: 1, tipoIdentificacion: "CEDULA" as const, identificacion: "1234567890", nombres: "Juan", apellidos: "Perez", email: "juan@test.com" },
        { clienteId: 2, tipoIdentificacion: "CEDULA" as const, identificacion: "1234567891", nombres: "Maria", apellidos: "Gonzalez", email: "maria@test.com" },
        { clienteId: 3, tipoIdentificacion: "CEDULA" as const, identificacion: "1234567892", nombres: "Pedro", apellidos: "Lopez", email: "pedro@test.com" },
    ];

    for (const c of clientesBase) {
        const created = await prisma.clientes.upsert({
            where: { clienteId: c.clienteId },
            update: {},
            create: c,
        });
        clientes.push(created);
    }

    // Generar 100 clientes adicionales
    for (let i = 4; i <= 103; i++) {
        const created = await prisma.clientes.create({
            data: {
                clienteId: i,
                tipoIdentificacion: "CEDULA",
                identificacion: `1310000${i.toString().padStart(4, '0')}`,
                nombres: `Cliente ${i}`,
                apellidos: `Apellido ${i}`,
                email: `cliente${i}@test.com`,
                telefono: `099000${i.toString().padStart(4, '0')}`,
            },
        });
        clientes.push(created);
    }

    return clientes;
}
