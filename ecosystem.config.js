module.exports = {
  apps: [
    {
      name: 'geldborse',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/home/wsl-win/projects/geldborse',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_file: '/home/wsl-win/projects/geldborse/logs/combined.log',
      out_file: '/home/wsl-win/projects/geldborse/logs/out.log',
      error_file: '/home/wsl-win/projects/geldborse/logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      restart_delay: 3000,
      max_restarts: 5,
      min_uptime: '10s',
      autorestart: true,
      watch: false,
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};
