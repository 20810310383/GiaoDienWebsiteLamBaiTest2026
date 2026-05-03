import React, { useState } from "react";
import { useTheme, themePresets } from "../../contexts/ThemeContext";
import styles from "./ThemeSwitcher.module.css";

const ThemeSwitcher = ({ showLabel = true }) => {
  const { currentTheme, setTheme, resetTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeList = [
    { key: "default", name: "Mặc định", color: "#185fa5" },
    { key: "forest", name: "Rừng xanh", color: "#15803d" },
    { key: "sunset", name: "Hoàng hôn", color: "#ea580c" },
    { key: "ocean", name: "Đại dương", color: "#0284c7" },
    { key: "lavender", name: "Lavender", color: "#7c3aed" },
  ];

  const handleSelectTheme = (themeKey) => {
    setTheme(themeKey);
    setIsOpen(false);
  };

  const currentThemeData = themeList.find((t) => t.key === currentTheme) || themeList[0];

  return (
    <div className={styles.container}>
      {showLabel && (
        <span className={styles.label}>Giao diện</span>
      )}

      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span
          className={styles.colorPreview}
          style={{ backgroundColor: currentThemeData.color }}
        />
        <span className={styles.themeName}>{currentThemeData.name}</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.open : ""}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>Chọn giao diện</div>
          {themeList.map((theme) => (
            <button
              key={theme.key}
              className={`${styles.themeOption} ${
                currentTheme === theme.key ? styles.active : ""
              }`}
              onClick={() => handleSelectTheme(theme.key)}
            >
              <span
                className={styles.optionColor}
                style={{ backgroundColor: theme.color }}
              />
              <span className={styles.optionName}>{theme.name}</span>
              {currentTheme === theme.key && (
                <svg
                  className={styles.checkIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
          <div className={styles.dropdownDivider} />
          <button className={styles.resetBtn} onClick={resetTheme}>
            Đặt lại mặc định
          </button>
        </div>
      )}

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default ThemeSwitcher;
