import { EnhancedAppError, createError } from '../utils/errorHandling';

// Service Registration Types
type ServiceFactory<T> = () => T;
type AsyncServiceFactory<T> = () => Promise<T>;
type ServiceInstance<T> = T;

interface ServiceRegistration<T = any> {
  factory: ServiceFactory<T> | AsyncServiceFactory<T>;
  singleton: boolean;
  instance?: T;
  dependencies?: string[];
  initialized?: boolean;
}

// Service Container Interface
export interface IServiceContainer {
  register<T>(key: string, factory: ServiceFactory<T>, dependencies?: string[]): void;
  registerSingleton<T>(key: string, factory: ServiceFactory<T>, dependencies?: string[]): void;
  registerAsync<T>(key: string, factory: AsyncServiceFactory<T>, dependencies?: string[]): void;
  registerValue<T>(key: string, value: T): void;
  resolve<T>(key: string): T;
  resolveAsync<T>(key: string): Promise<T>;
  isRegistered(key: string): boolean;
  unregister(key: string): void;
  clear(): void;
  getRegisteredServices(): string[];
}

// Dependency Injection Container
export class ServiceContainer implements IServiceContainer {
  private services: Map<string, ServiceRegistration> = new Map();
  private resolving: Set<string> = new Set(); // For circular dependency detection
  private initialized: Set<string> = new Set();

  // Register transient service (new instance every time)
  register<T>(
    key: string, 
    factory: ServiceFactory<T>, 
    dependencies: string[] = []
  ): void {
    if (this.services.has(key)) {
      throw createError.validation(`Service ${key} is already registered`);
    }

    this.services.set(key, {
      factory,
      singleton: false,
      dependencies,
    });
  }

  // Register singleton service (same instance every time)
  registerSingleton<T>(
    key: string, 
    factory: ServiceFactory<T>, 
    dependencies: string[] = []
  ): void {
    if (this.services.has(key)) {
      throw createError.validation(`Service ${key} is already registered`);
    }

    this.services.set(key, {
      factory,
      singleton: true,
      dependencies,
    });
  }

  // Register async service factory
  registerAsync<T>(
    key: string, 
    factory: AsyncServiceFactory<T>, 
    dependencies: string[] = []
  ): void {
    if (this.services.has(key)) {
      throw createError.validation(`Service ${key} is already registered`);
    }

    this.services.set(key, {
      factory,
      singleton: true, // Async services are always singletons
      dependencies,
    });
  }

  // Register a pre-created value
  registerValue<T>(key: string, value: T): void {
    if (this.services.has(key)) {
      throw createError.validation(`Service ${key} is already registered`);
    }

    this.services.set(key, {
      factory: () => value,
      singleton: true,
      instance: value,
      dependencies: [],
      initialized: true,
    });
  }

  // Resolve service synchronously
  resolve<T>(key: string): T {
    if (this.resolving.has(key)) {
      throw createError.businessRule(`Circular dependency detected for service: ${key}`);
    }

    const registration = this.services.get(key);
    if (!registration) {
      throw createError.notFound(`Service: ${key}`);
    }

    // Return existing singleton instance
    if (registration.singleton && registration.instance !== undefined) {
      return registration.instance as T;
    }

    // Resolve dependencies first
    this.resolving.add(key);
    try {
      const dependencies = this.resolveDependencies(registration.dependencies || []);
      
      // Create instance
      const instance = (registration.factory as ServiceFactory<T>)();
      
      // Store singleton instance
      if (registration.singleton) {
        registration.instance = instance;
        registration.initialized = true;
      }

      // Inject dependencies if the instance supports it
      if (instance && typeof instance === 'object' && 'setDependencies' in instance) {
        (instance as any).setDependencies(dependencies);
      }

      return instance;
    } finally {
      this.resolving.delete(key);
    }
  }

  // Resolve service asynchronously
  async resolveAsync<T>(key: string): Promise<T> {
    if (this.resolving.has(key)) {
      throw createError.businessRule(`Circular dependency detected for service: ${key}`);
    }

    const registration = this.services.get(key);
    if (!registration) {
      throw createError.notFound(`Service: ${key}`);
    }

    // Return existing singleton instance
    if (registration.singleton && registration.instance !== undefined) {
      return registration.instance as T;
    }

    // Resolve dependencies first
    this.resolving.add(key);
    try {
      const dependencies = await this.resolveDependenciesAsync(registration.dependencies || []);
      
      // Create instance (handle both sync and async factories)
      let instance: T;
      const factory = registration.factory;
      
      if (this.isAsyncFactory(factory)) {
        instance = await (factory as AsyncServiceFactory<T>)();
      } else {
        instance = (factory as ServiceFactory<T>)();
      }
      
      // Store singleton instance
      if (registration.singleton) {
        registration.instance = instance;
        registration.initialized = true;
      }

      // Inject dependencies if the instance supports it
      if (instance && typeof instance === 'object' && 'setDependencies' in instance) {
        (instance as any).setDependencies(dependencies);
      }

      return instance;
    } finally {
      this.resolving.delete(key);
    }
  }

  // Check if service is registered
  isRegistered(key: string): boolean {
    return this.services.has(key);
  }

  // Unregister a service
  unregister(key: string): void {
    const registration = this.services.get(key);
    if (registration && registration.instance && typeof registration.instance === 'object') {
      // Call cleanup if available
      if ('destroy' in registration.instance) {
        try {
          (registration.instance as any).destroy();
        } catch (error) {
          console.error(`Error destroying service ${key}:`, error);
        }
      }
    }
    
    this.services.delete(key);
    this.initialized.delete(key);
  }

  // Clear all services
  clear(): void {
    // Destroy all singletons
    for (const [key, registration] of this.services.entries()) {
      if (registration.instance && typeof registration.instance === 'object' && 'destroy' in registration.instance) {
        try {
          (registration.instance as any).destroy();
        } catch (error) {
          console.error(`Error destroying service ${key}:`, error);
        }
      }
    }

    this.services.clear();
    this.initialized.clear();
    this.resolving.clear();
  }

  // Get list of registered services
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  // Initialize all registered services (useful for app startup)
  async initializeAllServices(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const key of this.services.keys()) {
      if (!this.initialized.has(key)) {
        promises.push(
          this.resolveAsync(key).then(() => {
            this.initialized.add(key);
          }).catch(error => {
            console.error(`Failed to initialize service ${key}:`, error);
            throw error;
          })
        );
      }
    }

    await Promise.all(promises);
  }

  // Get service health status
  getServiceHealth(): Record<string, {
    registered: boolean;
    initialized: boolean;
    singleton: boolean;
    dependencies: string[];
    hasInstance: boolean;
  }> {
    const health: Record<string, any> = {};

    for (const [key, registration] of this.services.entries()) {
      health[key] = {
        registered: true,
        initialized: this.initialized.has(key),
        singleton: registration.singleton,
        dependencies: registration.dependencies || [],
        hasInstance: registration.instance !== undefined,
      };
    }

    return health;
  }

  // Private helper methods
  private resolveDependencies(dependencies: string[]): Record<string, any> {
    const resolved: Record<string, any> = {};
    
    for (const dep of dependencies) {
      resolved[dep] = this.resolve(dep);
    }
    
    return resolved;
  }

  private async resolveDependenciesAsync(dependencies: string[]): Promise<Record<string, any>> {
    const resolved: Record<string, any> = {};
    
    for (const dep of dependencies) {
      resolved[dep] = await this.resolveAsync(dep);
    }
    
    return resolved;
  }

  private isAsyncFactory<T>(
    factory: ServiceFactory<T> | AsyncServiceFactory<T>
  ): factory is AsyncServiceFactory<T> {
    // Check if the factory returns a Promise
    try {
      const result = factory();
      return result instanceof Promise;
    } catch {
      return false;
    }
  }
}

// Global service container instance
export const serviceContainer = new ServiceContainer();

// Service decorator for easy registration
export function Service(key: string, dependencies: string[] = []) {
  return function <T extends new (...args: any[]) => {}>(constructor: T) {
    serviceContainer.registerSingleton(key, () => new constructor(), dependencies);
    return constructor;
  };
}

// Injectable decorator for marking dependencies
export function Injectable(dependencies: string[] = []) {
  return function <T extends new (...args: any[]) => {}>(constructor: T) {
    // Store dependency metadata
    (constructor as any).__dependencies = dependencies;
    return constructor;
  };
}

// Inject decorator for property injection
export function Inject(serviceKey: string) {
  return function (target: any, propertyKey: string) {
    // Store injection metadata
    if (!target.__injections) {
      target.__injections = {};
    }
    target.__injections[propertyKey] = serviceKey;
  };
}

// Service locator pattern for easy access
export class ServiceLocator {
  static get<T>(key: string): T {
    return serviceContainer.resolve<T>(key);
  }

  static async getAsync<T>(key: string): Promise<T> {
    return serviceContainer.resolveAsync<T>(key);
  }

  static has(key: string): boolean {
    return serviceContainer.isRegistered(key);
  }
}

// Utility function to create service with dependencies
export function createServiceWithDeps<T>(
  factory: (deps: Record<string, any>) => T,
  dependencies: string[]
): ServiceFactory<T> {
  return () => {
    const deps: Record<string, any> = {};
    for (const dep of dependencies) {
      deps[dep] = serviceContainer.resolve(dep);
    }
    return factory(deps);
  };
}

// Service configuration builder
export class ServiceBuilder {
  private container: ServiceContainer;

  constructor(container: ServiceContainer = serviceContainer) {
    this.container = container;
  }

  register<T>(key: string): ServiceRegistrationBuilder<T> {
    return new ServiceRegistrationBuilder<T>(key, this.container);
  }
}

class ServiceRegistrationBuilder<T> {
  constructor(
    private key: string,
    private container: ServiceContainer
  ) {}

  transient(factory: ServiceFactory<T>): ServiceDependencyBuilder<T> {
    return new ServiceDependencyBuilder<T>(this.key, factory, false, this.container);
  }

  singleton(factory: ServiceFactory<T>): ServiceDependencyBuilder<T> {
    return new ServiceDependencyBuilder<T>(this.key, factory, true, this.container);
  }

  asyncSingleton(factory: AsyncServiceFactory<T>): ServiceDependencyBuilder<T> {
    return new ServiceDependencyBuilder<T>(this.key, factory, true, this.container);
  }

  value(instance: T): void {
    this.container.registerValue(this.key, instance);
  }
}

class ServiceDependencyBuilder<T> {
  constructor(
    private key: string,
    private factory: ServiceFactory<T> | AsyncServiceFactory<T>,
    private singleton: boolean,
    private container: ServiceContainer
  ) {}

  withDependencies(dependencies: string[]): void {
    if (this.singleton) {
      if (this.isAsyncFactory(this.factory)) {
        this.container.registerAsync(this.key, this.factory as AsyncServiceFactory<T>, dependencies);
      } else {
        this.container.registerSingleton(this.key, this.factory as ServiceFactory<T>, dependencies);
      }
    } else {
      this.container.register(this.key, this.factory as ServiceFactory<T>, dependencies);
    }
  }

  build(): void {
    this.withDependencies([]);
  }

  private isAsyncFactory<U>(
    factory: ServiceFactory<U> | AsyncServiceFactory<U>
  ): factory is AsyncServiceFactory<U> {
    try {
      const result = factory();
      return result instanceof Promise;
    } catch {
      return false;
    }
  }
}

// Export service builder instance
export const serviceBuilder = new ServiceBuilder();