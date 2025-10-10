// Navigation service for handling programmatic navigation
// This avoids making HTTP requests when redirecting in SPAs

class NavigationService {
  private static instance: NavigationService;
  private navigate: ((path: string) => void) | null = null;

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  setNavigate(navigate: (path: string) => void) {
    this.navigate = navigate;
  }

  redirectToLogin() {
    if (this.navigate) {
      this.navigate('/login');
    } else {
      // Fallback for when navigate is not set (e.g., during app initialization)
      window.location.replace('/login');
    }
  }

  redirectToHome() {
    if (this.navigate) {
      this.navigate('/');
    } else {
      window.location.replace('/');
    }
  }
}

export const navigationService = NavigationService.getInstance();
