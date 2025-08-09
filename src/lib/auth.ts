export const setAuthToken = (userData: any) => {
  sessionStorage.setItem('auth', JSON.stringify(userData));
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const auth = sessionStorage.getItem('auth');
    return auth ? JSON.parse(auth) : null;
  }
  return null;
};

export const removeAuthToken = () => {
  sessionStorage.removeItem('auth');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};