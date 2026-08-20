import webpush from "web-push";

export function initWebPush() {
  webpush.setVapidDetails(
    "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
  );
}

// Sends `payload` to every stored subscription, dropping any that have
// expired (the push service rejects them once the browser un-registers).
export async function sendPushToAll(db: any, subs: any[], payload: object): Promise<number> {
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification(s.subscription, JSON.stringify(payload));
      sent++;
    } catch (e) {
      await db.from("push_subscriptions").delete().eq("id", s.id);
    }
  }
  return sent;
}
