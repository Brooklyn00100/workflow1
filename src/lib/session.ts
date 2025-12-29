import { cookies } from "next/headers";

const SESSION_COOKIE = "workflow_session";

export type SessionInfo = {
  userId: string;
  role: "ADMIN" | "EMPLOYER" | "STUDENT";
};

export async function getSession(): Promise<SessionInfo | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [userId, role] = raw.split(":");
  if (!userId || (role !== "ADMIN" && role !== "EMPLOYER" && role !== "STUDENT")) {
    return null;
  }
  return { userId, role };
}

export async function setSession(session: SessionInfo) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${session.userId}:${session.role}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}
