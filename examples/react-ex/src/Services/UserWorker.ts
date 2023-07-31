import { BusWorker, ObjectCopyTransport, ServiceGetter } from 'web-worker-bus';
import { container } from './UserWorkerContainer';

/* eslint-disable-next-line no-restricted-globals */
const worker = self as unknown as Worker;

const serviceGetter: ServiceGetter = (serviceName) => container[serviceName as keyof typeof container];
BusWorker.connectToBus(new ObjectCopyTransport(worker), serviceGetter);
