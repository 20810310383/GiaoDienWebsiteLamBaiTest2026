import { useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL 

export const useSocketPosts = (setPosts) => {
  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true, transports: ["websocket", "polling"], });

    // Lắng nghe sự kiện Like Realtime
    socket.onAny((eventName, data) => {
      if (eventName.startsWith("reaction_post_")) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === data.postId ? { ...p, likes: new Array(data.likesCount).fill(0) } : p
          )
        );
      }

      if (eventName.startsWith("new_comment_")) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === data.postId ? { ...p, comments: [...p.comments, data.comment] } : p
          )
        );
      }
    });

    return () => socket.disconnect();
  }, [setPosts]);
};