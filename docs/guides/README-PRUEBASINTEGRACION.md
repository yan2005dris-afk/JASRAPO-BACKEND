Cómo Ejecutar

# Con TestContainers (requiere Docker)

npm run test:e2e

# Fallback (sin Docker, usa mocks)

npm run test:e2e -- --testPathPattern=fallback
Con Docker Real

# Crear base de datos test

export TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/jasrapo_e2e"
npm run test:e2e
