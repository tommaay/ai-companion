import { auth, currentUser } from '@clerk/nextjs/server';

export async function getAuthUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();

  if (!user) {
    return null;
  }

  return user;
}
