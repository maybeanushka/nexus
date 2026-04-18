const { exec } = require('child_process');

const INTERVAL_MS = 5 * 60 * 1000; // 5 Minutes

function runScript() {
  console.log(`[${new Date().toLocaleString()}] Triggering Nudge Protocol...`);
  exec('node scripts/email_nudge.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(stdout);
  });
}

// Run once immediately
runScript();

// Then run every 5 hours
setInterval(runScript, INTERVAL_MS);

console.log(`Nexus Nudge Service started. Running every 5 hours.`);
