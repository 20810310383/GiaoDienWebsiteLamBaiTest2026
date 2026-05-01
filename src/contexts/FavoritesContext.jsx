import React, { createContext, useContext } from "react";
import { useFavoritesLogic } from "../hook/useFavoritesLogic";

// 1. Tạo Context
const FavoritesContext = createContext(null);

// 2. Provider giờ chỉ gọi hook và truyền value
export const FavoritesProvider = ({ children }) => {
  // ✅ Gọi hook logic một lần duy nhất tại đây
  const favorites = useFavoritesLogic();

  return (
    <FavoritesContext.Provider value={favorites}>
      {children}
    </FavoritesContext.Provider>
  );
};

// 3. Hook "tai nghe" không thay đổi
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === null) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
