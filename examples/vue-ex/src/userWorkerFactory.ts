import { MainThreadBus, ObjectCopyTransport } from 'web-worker-bus';

const worker = new Worker(new URL('./Services/UserWorker', import.meta.url), { type: 'module' });
const userTransport = new ObjectCopyTransport(worker);
MainThreadBus.instance.registerBusWorkers([userTransport]);
export const userWorkerFactory = MainThreadBus.instance.createFactoryService(userTransport);
