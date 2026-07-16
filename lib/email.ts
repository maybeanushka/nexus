import nodemailer from "nodemailer";

const appUrl = process.env.NEXUS_APP_URL!;
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  await transporter.sendMail({
    from: `"Nexus Clearance Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

function emailLayout(content: string) {
  return `
    <div style="background:#f3f4f6;padding:40px 0;">
      <div style="max-width:650px;margin:auto;background:white;border-radius:16px;overflow:hidden;font-family:Arial,sans-serif;box-shadow:0 10px 25px rgba(0,0,0,.08);">

        <div style="background:#4f46e5;padding:28px;text-align:center;">
          <h1 style="margin:0;color:white;font-size:28px;">
            Nexus Clearance Portal
          </h1>
          <p style="margin-top:8px;color:#ddd;">
            Sardar Patel Institute of Technology
          </p>
        </div>

        <div style="padding:32px;">
          ${content}
        </div>

        <div style="background:#f8fafc;padding:20px;text-align:center;font-size:13px;color:#64748b;border-top:1px solid #e5e7eb;">
          This is an automated email from the
          <strong>Nexus Clearance Portal</strong>.
          <br/>
          Please do not reply to this email.
        </div>

      </div>
    </div>
  `;
}

export async function sendStudentNotification(
  studentEmail: string,
  studentName: string,
  stage: string,
  status: string,
  notes: string = ""
) {
    const color = status === "approved" ? "#16a34a" : "#dc2626";
    let subject = "";
    let intro = "";
    let nextStep = "";

    if (status === "approved") {
    if (stage === "Laboratory In-charge") {
        subject = "Laboratory Clearance Approved";
        intro =
        "Your application has successfully cleared the Laboratory Review stage.";
        nextStep = "Head of Department Review";
    } else if (stage === "Head of Department") {
        subject = "Department Clearance Approved";
        intro =
        "Your application has successfully cleared the Department Review stage.";
        nextStep = "Principal Review";
    } else {
        subject = "Clearance Approved Successfully";
        intro =
        "Congratulations! Your institutional clearance has been completed successfully.";
        nextStep = "Your certificate is now available for download.";
    }
    } else {
    subject = "Action Required: Clearance Application";
    intro = `Your application was reviewed by the ${stage} and requires your attention.`;
    }

  await sendEmail(
    studentEmail,
    subject,
    emailLayout(
    `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2 style="color:#4f46e5">Nexus Clearance Portal</h2>

        <p>Hello <strong>${studentName}</strong>,</p>

        <p>${intro}</p>

        <table style="border-collapse:collapse;width:100%;margin:20px 0">
          <tr>
            <td><strong>Stage</strong></td>
            <td>${stage}</td>
          </tr>

          <tr>
            <td><strong>Status</strong></td>
            <td style="color:${color};font-weight:bold;text-transform:uppercase">
              ${status}
            </td>
          </tr>
        </table>
        ${
            status === "approved"
                ? `
            <div style="background:#ecfdf5;padding:15px;border-left:4px solid #16a34a;margin:20px 0;">
            <strong>Next Step</strong><br/>
            ${nextStep}
            </div>
            `
                : ""
        }
        
        ${
        status === "rejected"
            ? `
        <div style="background:#fef2f2;padding:18px;border-left:4px solid #dc2626;margin:20px 0;">
        <strong style="color:#dc2626;">Reason for Rejection</strong><br/><br/>
        ${notes || "No remarks were provided."}
        </div>

        <div style="background:#f8fafc;padding:18px;border-left:4px solid #4f46e5;margin:20px 0;">
        <strong>Next Step</strong><br/><br/>
        Please correct the above issue(s), upload the required documents, and resubmit your application through the Nexus portal.
        </div>
        `
            : notes
            ? `
        <div style="background:#f8fafc;padding:15px;border-left:4px solid #4f46e5">
        <strong>Remarks</strong><br/>
        ${notes}
        </div>
        `
            : ""
        }

        <p style="margin-top:24px">
        You can view the latest status and take the required action by logging in to your Nexus dashboard.
        </p>

        <div style="text-align:center;margin-top:30px;">
            <a
                href="${appUrl}/student-dashboard"
                style="
                background:#4f46e5;
                color:white;
                padding:14px 30px;
                text-decoration:none;
                border-radius:10px;
                font-weight:bold;
                display:inline-block;
                "
            >
                Open Nexus Dashboard
            </a>
        </div>

        <hr/>

        <small>
          This is an automated email from Nexus Clearance Portal.
        </small>
      </div>
    `),
  );
}

export async function sendSubmissionEmail(
  studentEmail: string,
  studentName: string
) {
  await sendEmail(
    studentEmail,
    "Application Submitted Successfully",
    emailLayout(
    `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2 style="color:#4f46e5">Nexus Clearance Portal</h2>

        <p>Hello <strong>${studentName}</strong>,</p>

        <p>Your clearance application has been submitted successfully.</p>

        <div style="background:#eef2ff;padding:16px;border-left:4px solid #4f46e5;margin:24px 0">
          <strong>Current Stage</strong><br>
          Laboratory Review
        </div>

        <p>
          You will receive an email whenever your application moves to the next stage.
        </p>

        <p>
          You can also track the progress from your Nexus dashboard.
        </p>

        <div style="text-align:center;margin-top:30px;">
            <a
                href="${appUrl}/student-dashboard"
                style="
                background:#4f46e5;
                color:white;
                padding:14px 30px;
                text-decoration:none;
                border-radius:10px;
                font-weight:bold;
                display:inline-block;
                "
            >
                Open Nexus Dashboard
            </a>
        </div>

        <hr>

        <small>
          This is an automated email from Nexus Clearance Portal.
        </small>
      </div>
    `)
  );
}

export async function sendCertificateEmail(
  studentEmail: string,
  studentName: string
) {
  await sendEmail(
    studentEmail,
    "Your Clearance Certificate is Ready 🎉",
    emailLayout(
    `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2 style="color:#4f46e5">Congratulations!</h2>

        <p>Hello <strong>${studentName}</strong>,</p>

        <p>
          Your clearance process has been completed successfully.
        </p>

        <div style="background:#ecfdf5;padding:16px;border-left:4px solid #16a34a;margin:24px 0">
          <strong>Status</strong><br>
          Clearance Approved
        </div>

        <p>
          Your clearance certificate is now available for download in your Nexus dashboard.
        </p>

        <div style="text-align:center;margin-top:30px;">
            <a
                href="${appUrl}/student-dashboard"
                style="
                background:#4f46e5;
                color:white;
                padding:14px 30px;
                text-decoration:none;
                border-radius:10px;
                font-weight:bold;
                display:inline-block;
                "
            >
                Open Nexus Dashboard
            </a>
        </div>

        <p>
          Thank you for using the Nexus Clearance Portal.
        </p>

        <hr>

        <small>
          This is an automated email from Nexus Clearance Portal.
        </small>
      </div>
    `)
  );
}