import { Clientes, PrismaClient } from "src/generated/prisma/client";

export async function seedClientes(prisma: PrismaClient) {
    const clientes: any[] = [];
    
    // Clientes originales
    const clientesBase  = [
        { clienteId: 7, tipoIdentificacion: "CEDULA" as const, identificacion: "1234567890", nombres: "Juan", apellidos: "Perez", email: "juan@test.com" },
        { clienteId: 8, tipoIdentificacion: "CEDULA" as const, identificacion: "1234567891", nombres: "Maria", apellidos: "Gonzalez", email: "maria@test.com" },
        { clienteId: 9, tipoIdentificacion: "CEDULA" as const, identificacion: "1234567892", nombres: "Pedro", apellidos: "Lopez", email: "pedro@test.com" },
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
    for (let i = 10; i <= 109; i++) {
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
