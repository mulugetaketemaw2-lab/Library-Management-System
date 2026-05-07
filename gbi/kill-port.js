const { exec } = require('child_process');
const os = require('os');

const PORT = 5001;

console.log(`🔍 Attempting to kill process on port ${PORT}...`);

if (os.platform() === 'win32') {
  // Windows
  exec(`netstat -ano | findstr :${PORT}`, (err, stdout) => {
    if (stdout) {
      const lines = stdout.split('\n');
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4) {
          const pid = parts[4];
          console.log(`🔄 Killing process PID: ${pid}`);
          exec(`taskkill /F /PID ${pid}`, (err) => {
            if (!err) console.log(`✅ Killed process ${pid}`);
          });
        }
      });
    } else {
      console.log(`✅ Port ${PORT} is already free`);
    }
  });
} else {
  // Mac/Linux
  exec(`lsof -i :${PORT} -t`, (err, stdout) => {
    if (stdout) {
      const pid = stdout.trim();
      console.log(`🔄 Killing process PID: ${pid}`);
      exec(`kill -9 ${pid}`, (err) => {
        if (!err) console.log(`✅ Killed process ${pid}`);
      });
    } else {
      console.log(`✅ Port ${PORT} is already free`);
    }
  });
}