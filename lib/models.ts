import mongoose from 'mongoose';

const { Schema } = mongoose;

// User Schema
const userSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'lab_admin', 'hod_admin', 'principal_admin'] },
  reg_no: String,
  batch: String,
  dob: String,
  phone: String,
  branch: String,
  profile_picture: String,
  created_at: { type: Date, default: Date.now }
});

// Application Schema
const applicationSchema = new Schema({
  _id: { type: String, required: true },
  student_id: { type: String, ref: 'User', required: true },
  lab_status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  hod_status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  principal_status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  overall_status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  last_rejected_stage: {
    type: String,
    enum: ['lab', 'hod', 'principal', null],
    default: null
  },
  last_nudge_at: Date,
  submitted_at: { type: Date, default: Date.now },
  reviewed_at: Date
});

// Document Schema
const documentSchema = new Schema({
  _id: { type: String, required: true },
  application_id: { type: String, ref: 'Application', required: true },
  doc_type: { type: String, required: true, enum: ['id_card', 'library_receipt', 'lab_records'] },
  file_url: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now }
});

// Due Schema
const dueSchema = new Schema({
  _id: { type: String, required: true },
  student_id: { type: String, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['library', 'other'] },
  amount: { type: Number, required: true },
  details: String,
  pending_books: {
    type: Number,
    default: 0
  },
  books: [
    {
      title: String,
      author: String,
      due_date: Date
    }
  ],
  status: { type: String, default: 'pending', enum: ['pending', 'paid'] },
  transaction_id: String,
  created_at: { type: Date, default: Date.now }
});

// Transaction Schema
const transactionSchema = new Schema({
  _id: { type: String, required: true },
  student_id: { type: String, ref: 'User', required: true },
  amount: { type: Number, required: true },
  razorpay_order_id: String,
  razorpay_payment_id: {
    type: String,
    unique: true,
  },
  qr_data: { type: String, required: true },
  status: {
    type: String,
    enum: ['success', 'failed', 'refunded'],
    default: 'success',
  },
  paid_at: {
    type: Date,
    default: Date.now,
  },
  created_at: { type: Date, default: Date.now }
});

// AuditLog Schema
const auditLogSchema = new Schema({
  _id: { type: String, required: true },
  application_id: { type: String, ref: 'Application', required: true },
  actor_id: { type: String, ref: 'User' },
  action: { type: String, required: true },
  remarks: String,
  created_at: { type: Date, default: Date.now }
});

// Notification Schema
const notificationSchema = new Schema({
  _id: { type: String, required: true },

  user_id: {
    type: String,
    ref: "User",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  message: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["success", "info", "warning", "error"],
    default: "info",
  },

  read: {
    type: Boolean,
    default: false,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Session Schema
const sessionSchema = new Schema({
  _id: { type: String, required: true },
  user_id: { type: String, ref: 'User', required: true },
  expires_at: { type: Date, required: true }
});

if (mongoose.models.User) delete mongoose.models.User;
export const User = mongoose.model('User', userSchema);

if (mongoose.models.Application) delete mongoose.models.Application;
export const Application = mongoose.model('Application', applicationSchema);

if (mongoose.models.Document) delete mongoose.models.Document;
export const DocumentModel = mongoose.model('Document', documentSchema);

if (mongoose.models.Due) delete mongoose.models.Due;
export const Due = mongoose.model('Due', dueSchema);

if (mongoose.models.Transaction) delete mongoose.models.Transaction;
export const Transaction = mongoose.model('Transaction', transactionSchema);

if (mongoose.models.AuditLog) delete mongoose.models.AuditLog;
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

if (mongoose.models.Notification) delete mongoose.models.Notification;
export const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

if (mongoose.models.Session) delete mongoose.models.Session;
export const Session = mongoose.model('Session', sessionSchema);


