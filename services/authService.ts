const SESSION_KEY = 'carrossel-autoedit-session';

interface Session {
  token: string;
  email: string;
  name: string;
}

// Mock login function
export const login = (email: string, password: string): Promise<Session | null> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (email === 'ngxgrowth@gmail.com' && password === '@gab123654') {
        const sessionData: Session = {
          token: `mock_token_${Date.now()}`,
          email: 'ngxgrowth@gmail.com',
          name: 'Gabriel Vieira',
        };
        try {
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
          resolve(sessionData);
        } catch (error) {
          console.error("Could not save session to localStorage", error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    }, 1000); // Simulate network delay
  });
};

export const logout = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("Could not remove session from localStorage", error);
  }
};

export const getSession = (): Session | null => {
  try {
    const sessionJson = localStorage.getItem(SESSION_KEY);
    if (!sessionJson) {
      return null;
    }
    return JSON.parse(sessionJson);
  } catch (error) {
    console.error("Could not retrieve session from localStorage", error);
    return null;
  }
};
