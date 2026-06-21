const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const path = require('path');
const readline = require('readline');
const { stdin, stdout } = require('process');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const ADMIN_ROLES = ['lab_admin', 'hod_admin', 'principal_admin'];
const BRANCHES = ['CS', 'IT', 'Mechanical', 'Electrical', 'Civil'];

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', ...ADMIN_ROLES] },
  branch: String,
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

function createInterface() {
  return readline.createInterface({
    input: stdin,
    output: stdout,
    terminal: true
  });
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function askHidden(rl, question) {
  return new Promise((resolve) => {
    const originalWrite = rl._writeToOutput;

    rl._writeToOutput = function writeHidden(stringToWrite) {
      if (rl.stdoutMuted) {
        rl.output.write('*');
      } else {
        rl.output.write(stringToWrite);
      }
    };

    rl.output.write(question);
    rl.stdoutMuted = true;
    rl.question('', (answer) => {
      rl.stdoutMuted = false;
      rl._writeToOutput = originalWrite;
      rl.output.write('\n');
      resolve(answer.trim());
    });
  });
}

async function promptForAdmin() {
  const rl = createInterface();

  try {
    const name = await ask(rl, 'Name: ');
    const email = (await ask(rl, 'Email: ')).toLowerCase();
    const password = await askHidden(rl, 'Password: ');

    console.log('\nRoles:');
    ADMIN_ROLES.forEach((role, index) => {
      console.log(`${index + 1}. ${role}`);
    });

    const roleAnswer = await ask(rl, 'Role: ');
    const role = ADMIN_ROLES[Number(roleAnswer) - 1] || roleAnswer;

    let branch = '';
    if (role === 'hod_admin') {
      console.log('\nBranches:');
      BRANCHES.forEach((branchName, index) => {
        console.log(`${index + 1}. ${branchName}`);
      });

      const branchAnswer = await ask(rl, 'Branch: ');
      branch = BRANCHES[Number(branchAnswer) - 1] || branchAnswer;
    }

    return { name, email, password, role, branch };
  } finally {
    rl.close();
  }
}

function validateAdminInput(admin) {
  if (!admin.name) return 'Name is required.';
  if (!admin.email) return 'Email is required.';
  if (!admin.email.includes('@')) return 'Email must be valid.';
  if (!admin.password) return 'Password is required.';
  if (admin.password.length < 8) return 'Password must be at least 8 characters.';
  if (!ADMIN_ROLES.includes(admin.role)) {
    return `Role must be one of: ${ADMIN_ROLES.join(', ')}.`;
  }
  if (admin.role === 'hod_admin' && !BRANCHES.includes(admin.branch)) {
    return `HOD admin branch must be one of: ${BRANCHES.join(', ')}.`;
  }
  return null;
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing required environment variable: MONGODB_URI.');
    console.error('Create .env.local and set MONGODB_URI before running this script.');
    process.exitCode = 1;
    return;
  }

  const admin = await promptForAdmin();
  const validationError = validateAdminInput(admin);

  if (validationError) {
    console.error(`Admin account was not created: ${validationError}`);
    process.exitCode = 1;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingUser = await User.findOne({ email: admin.email }).lean();
    if (existingUser) {
      console.error(`Admin account was not created: email already exists (${admin.email}).`);
      process.exitCode = 1;
      return;
    }

    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const userData = {
      _id: crypto.randomUUID(),
      name: admin.name,
      email: admin.email,
      password: hashedPassword,
      role: admin.role
    };

    if (admin.role === 'hod_admin') {
      userData.branch = admin.branch;
    }

    await User.create(userData);
    console.log(`Admin account created for ${admin.email} with role ${admin.role}.`);
  } catch (error) {
    console.error('Failed to create admin account.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
