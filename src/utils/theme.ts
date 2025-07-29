export const applyTheme = (isDark: boolean) => {
  localStorage.setItem("isDark", JSON.stringify(isDark));
  const html = document.documentElement;

  html.classList.toggle("dark", isDark);
};
