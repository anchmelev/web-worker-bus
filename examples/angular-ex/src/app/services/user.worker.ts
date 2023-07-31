// import { BusWorker, ObjectCopyTransport, ServiceGetter } from 'web-worker-bus';
import { BusWorker } from './../../../../../src/BusWorker';
import { ServiceGetter } from './../../../../../src/BusTypes';
import { ObjectCopyTransport } from './../../../../../src/ObjectCopyTransport';
import { container } from './user.worker.container';

/* eslint-disable-next-line no-restricted-globals */
const worker = self as unknown as Worker;

const serviceGetter: ServiceGetter = (serviceName) => container[serviceName as keyof typeof container];
BusWorker.connectToBus(new ObjectCopyTransport(worker), serviceGetter);
