import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  it('should create a valid UserEntity instance', () => {
    const user = UserEntity.create({
      usuarioId: 1,
      email: 'test@example.com',
      nombres: 'Juan',
      apellidos: 'Pérez',
      telefono: '+593991234567',
    });

    expect(user).toBeInstanceOf(UserEntity);
    expect(user.getNombreCompleto()).toBe('Juan Pérez');
  });

  it('should throw error for invalid email format', () => {
    expect(() => {
      new UserEntity({
        email: 'invalid-email',
      });
    }).toThrow('El formato del correo electrónico es inválido');
  });

  it('should throw error for invalid phone format', () => {
    expect(() => {
      new UserEntity({
        email: 'user@example.com',
        telefono: 'abc-invalid',
      });
    }).toThrow('El formato del teléfono es inválido');
  });

  it('should update profile and email through domain methods', () => {
    const user = new UserEntity({
      usuarioId: 1,
      email: 'user@example.com',
      nombres: 'Carlos',
      apellidos: 'Mendoza',
    });

    user.updateProfile('Carlos Andrés', 'Mendoza V.', '+593999888777');
    expect(user.nombres).toBe('Carlos Andrés');
    expect(user.telefono).toBe('+593999888777');
    expect(user.getNombreCompleto()).toBe('Carlos Andrés Mendoza V.');

    user.updateEmail('carlos.new@example.com');
    expect(user.email).toBe('carlos.new@example.com');

    user.changeRole({ rolId: 2, nombre: 'OPERADOR' });
    expect(user.rol?.nombre).toBe('OPERADOR');
  });
});
