// ============================================
// ROUTING MODULE (Hash-based SPA routing)
// ============================================

const Router = {
  currentRoute: '',
  
  routes: {
    '': 'login',
    '#/dashboard': 'dashboard',
    '#/profile-settings': 'profile-settings',
    '#/set-details': 'set-details'
  },

  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  },

  handleRoute() {
    const hash = window.location.hash || '';
    const routeName = this.routes[hash];
    
    if (!routeName) {
      this.navigate('login');
      return;
    }

    this.currentRoute = routeName;
    this.showView(routeName);
  },

  showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
      view.style.display = 'none';
    });

    // Show requested view
    const view = document.getElementById(`${viewName}-view`);
    if (view) {
      view.style.display = 'block';
      
      // Show/hide navbar based on view
      const navbar = document.getElementById('navbar');
      const userDetailsCard = document.getElementById('user-details-card');
      
      if (viewName === 'login' || viewName === 'set-details') {
        navbar.style.display = 'none';
        userDetailsCard.style.display = 'none';
      } else {
        navbar.style.display = 'block';
        userDetailsCard.style.display = 'flex';
      }

      // Update active nav link
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === window.location.hash) {
          link.classList.add('active');
        }
      });
    }
  },

  navigate(route) {
    const routeMap = {
      'login': '',
      'dashboard': '#/dashboard',
      'profile-settings': '#/profile-settings',
      'set-details': '#/set-details'
    };

    const hash = routeMap[route];
    if (hash !== undefined) {
      window.location.hash = hash;
    }
  },

  getCurrentRoute() {
    return this.currentRoute;
  }
};
