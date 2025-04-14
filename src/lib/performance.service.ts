import { getPerformance, trace } from 'firebase/performance';
import { app } from './firebase';

const perf = getPerformance(app);

// Rastrear tempo de carregamento de dados
export function startDataLoadTrace(operationName: string) {
  const dataTrace = trace(perf, `data_load_${operationName}`);
  dataTrace.start();
  return dataTrace;
}

// Rastrear tempo de operações críticas
export function startOperationTrace(operationName: string) {
  const operationTrace = trace(perf, `operation_${operationName}`);
  operationTrace.start();
  return operationTrace;
}

// Rastrear métricas personalizadas
export function trackCustomMetric(traceName: string, metricName: string, value: number) {
  const customTrace = trace(perf, traceName);
  customTrace.putMetric(metricName, value);
  customTrace.start();
  return customTrace;
}

// Rastrear atributos personalizados
export function setCustomAttribute(traceName: string, attributeName: string, value: string) {
  const customTrace = trace(perf, traceName);
  customTrace.putAttribute(attributeName, value);
  return customTrace;
}
