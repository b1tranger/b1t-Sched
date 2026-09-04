// ============================================
// ROUTING MODULE (Hash-based SPA routing)
// ============================================

const Router = {
  currentRoute: '',
  _onRouteChangeCallback: null,
  
  routes: {
    '': 'login',
    '#/dashboard': 'dashboard',
    '#/profile-settings': 'profile-settings',
    '#/set-details': 'set-details',
    '#/user-management': 'user-management'
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

    // Notify listener of route change
    if (this._onRouteChangeCallback) {
      this._onRouteChangeCallback(routeName);
    }
  },

  onRouteChange(callback) {
    this._onRouteChangeCallback = callback;
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
        const mainContent = document.getElementById('main-content');
        if (mainContent) mainContent.classList.add('no-nav-padding');
      } else {
        navbar.style.display = 'block';
        userDetailsCard.style.display = 'flex';
        const mainContent = document.getElementById('main-content');
        if (mainContent) mainContent.classList.remove('no-nav-padding');
      }

      // Show/hide Notes & Approval buttons based on view (only show on dashboard)
      const noteToggleMobile = document.getElementById('note-toggle');
      const noteButtonDesktop = document.getElementById('note-button-desktop');
      const approvalToggleMobile = document.getElementById('approval-toggle');
      const approvalButtonDesktop = document.getElementById('approval-button-desktop');
      
      if (viewName === 'dashboard') {
        // Show Notes button only on dashboard
        if (noteToggleMobile && noteToggleMobile.style.display !== 'none') {
          noteToggleMobile.style.display = 'flex';
        }
        if (noteButtonDesktop && noteButtonDesktop.style.display !== 'none') {
          noteButtonDesktop.style.display = 'flex';
        }
        if (typeof ApprovalManager !== 'undefined' && ApprovalManager.updateVisibility) {
          const profile = typeof App !== 'undefined' ? App.userProfile : null;
          const role = typeof App !== 'undefined' ? (App.previewRole || (App.isAdmin ? 'Admin' : (App.isDptCoor ? 'DptCoor' : (App.isFaculty ? 'Faculty' : (App.isCR ? 'CR' : 'Student'))))) : 'Student';
          const dept = profile ? profile.department : null;
          ApprovalManager.updateVisibility(role, dept, typeof App !== 'undefined' && App.isCR, typeof App !== 'undefined' && App.isDptCoor, typeof App !== 'undefined' && App.isAdmin);
        }
      } else {
        // Hide Notes & Approval buttons on all other views
        if (noteToggleMobile) {
          noteToggleMobile.style.display = 'none';
        }
        if (noteButtonDesktop) {
          noteButtonDesktop.style.display = 'none';
        }
        if (approvalToggleMobile) {
          approvalToggleMobile.style.display = 'none';
        }
        if (approvalButtonDesktop) {
          approvalButtonDesktop.style.display = 'none';
        }
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
      'set-details': '#/set-details',
      'user-management': '#/user-management'
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
