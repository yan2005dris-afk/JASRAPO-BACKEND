import 'reflect-metadata';

export function LogContext(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata('log:context', target.name, target);
  };
}
