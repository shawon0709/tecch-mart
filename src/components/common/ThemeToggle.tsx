import { useState, useEffect } from 'react';
import { Button } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <Button
      type="text"
      icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
      onClick={toggleTheme}
    />
  );
}