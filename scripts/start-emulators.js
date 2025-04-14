#!/usr/bin/env node
import { spawn } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.bright}${colors.blue}Iniciando emuladores do Firebase...${colors.reset}\n`);

// Iniciar os emuladores do Firebase
const emulators = spawn('firebase', ['emulators:start'], {
  stdio: 'inherit',
  shell: true
});

// Gerenciar processo do emulador
emulators.on('error', (error) => {
  console.error(`${colors.red}Erro ao iniciar emuladores:${colors.reset}`, error);
  process.exit(1);
});

emulators.on('exit', (code) => {
  if (code !== 0) {
    console.error(`${colors.red}Emuladores encerraram com código ${code}${colors.reset}`);
    process.exit(code);
  }
});

// Gerenciar encerramento do processo
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Encerrando emuladores...${colors.reset}`);
  emulators.kill();
});

process.on('SIGTERM', () => {
  console.log(`\n${colors.yellow}Encerrando emuladores...${colors.reset}`);
  emulators.kill();
});
