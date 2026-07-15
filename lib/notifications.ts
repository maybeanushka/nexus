import dbConnect from "./db";
import { Notification } from "./models";

export async function createNotification({
  userId,
  title,
  message,
  type = "info",
}: {
  userId: string;
  title: string;
  message: string;
  type?: "success" | "info" | "warning" | "error";
}) {
  await dbConnect();

  await Notification.create({
    _id: crypto.randomUUID(),
    user_id: userId,
    title,
    message,
    type,
    read: false,
  });
}