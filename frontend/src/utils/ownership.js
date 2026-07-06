export function getCurrentUserId(user) {
  if (user?.id) {
    return String(user.id);
  }

  const storedUserId = localStorage.getItem("userId");
  if (storedUserId) {
    return String(storedUserId);
  }

  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(storedUser);
    return parsedUser?.id ? String(parsedUser.id) : null;
  } catch {
    return null;
  }
}

export function getPostOwnerId(post) {
  return (
    post?.userId ||
    post?.createdBy ||
    post?.posterId ||
    post?.driverId ||
    post?.sellerId ||
    post?.poster?.id ||
    post?.postedBy?.id ||
    null
  );
}

export function isOwnPost(post, currentUserId) {
  const ownerId = getPostOwnerId(post);
  return Boolean(currentUserId && ownerId && String(ownerId) === String(currentUserId));
}
