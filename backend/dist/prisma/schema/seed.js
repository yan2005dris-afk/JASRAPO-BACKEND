"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adapter_pg_1 = require("@prisma/adapter-pg");
require("dotenv/config");
const pg_1 = require("pg");
const client_1 = require("../../src/generated/prisma/client");
const menu_seed_1 = require("./seeds/menu.seed");
const menuPermission_seed_1 = require("./seeds/menuPermission.seed");
const permission_seed_1 = require("./seeds/permission.seed");
const role_seed_1 = require("./seeds/role.seed");
const rolePermission_seed_1 = require("./seeds/rolePermission.seed");
const roleHierarchy_seed_1 = require("./seeds/roleHierarchy.seed");
const user_seed_1 = require("./seeds/user.seed");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
});
async function main() {
    console.log('🌱 Seeding database...');
    console.log('🧹 Limpiando base de datos...');
    try {
        const tablenames = await prisma.$queryRaw `SELECT tablename FROM pg_tables WHERE schemaname='public'`;
        const tables = tablenames
            .map(({ tablename }) => tablename)
            .filter((name) => name !== '_prisma_migrations')
            .map((name) => `"public"."${name}"`)
            .join(', ');
        if (tables.length > 0) {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
        }
        console.log('✅ Base de datos limpiada correctamente desde 0.');
    }
    catch (error) {
        console.error('❌ Error limpiando base de datos', error);
    }
    const roles = await (0, role_seed_1.seedRoles)(prisma);
    console.log('✅ Roles creados correctamente.');
    await (0, roleHierarchy_seed_1.seedRoleHierarchy)(prisma, roles);
    console.log('✅ Jerarquia de Roles creada correctamente.');
    const permissions = await (0, permission_seed_1.seedPermissions)(prisma);
    console.log('✅ Permisos creados correctamente.');
    await (0, rolePermission_seed_1.seedRolePermissions)(prisma, roles, permissions);
    console.log('✅ Roles y Permisos asignados correctamente.');
    await (0, user_seed_1.seedUSers)(prisma, roles);
    console.log('✅ Usuarios creados correctamente.');
    const menus = await (0, menu_seed_1.seedMenus)(prisma);
    console.log('✅ Menus creados correctamente.');
    await (0, menuPermission_seed_1.seedMenuPermissions)(prisma, menus, permissions);
    console.log('✅ Permisos asignados a Menus correctamente.');
    console.log('✅ Seed finalizado: Roles y Permisos creados correctamente.');
}
main()
    .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map