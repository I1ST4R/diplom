const { spawn, spawnSync } = require('child_process');

function runSync(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: false });
  if (r.error) throw r.error;
  if (typeof r.status === 'number' && r.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} exited with code ${r.status}`);
  }
}

function spawnExpo() {
  const args = ['expo', 'start', '--android', '--port', '8082', '--host', 'localhost'];

  // На Windows надёжнее запускать npx через cmd.exe, иначе часто ловится spawn EINVAL
  if (process.platform === 'win32') {
    return spawn('cmd.exe', ['/d', '/s', '/c', `npx ${args.join(' ')}`], {
      stdio: 'inherit',
      shell: false,
    });
  }

  return spawn('npx', args, {
    stdio: 'inherit',
    shell: false,
  });
}

async function main() {
  // 1) Стартуем Expo (он сам поднимет эмулятор, если надо)
  const expo = spawnExpo();

  // 2) Дожидаемся устройства и настраиваем port reverse
  try {
    runSync('adb', ['wait-for-device']);
    runSync('adb', ['reverse', 'tcp:3001', 'tcp:3001']);
    runSync('adb', ['reverse', 'tcp:8082', 'tcp:8082']);
  } catch (e) {
    // Не падаем жёстко, чтобы хотя бы Expo продолжал работать и можно было увидеть ошибку/починить adb
    console.error('[android-with-reverse] adb reverse failed:', e?.message || e);
  }

  // 3) Ждём завершения Expo
  expo.on('exit', (code) => process.exit(code ?? 0));
}

main().catch((e) => {
  console.error('[android-with-reverse] fatal:', e?.message || e);
  process.exit(1);
});

