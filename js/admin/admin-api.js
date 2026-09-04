/**
 * AdminAPI - Client for Firebase Cloud Functions admin endpoints
 * Handles password reset and user deletion operations
 */
class AdminAPI {
  constructor() {
    // TODO: Replace with your actual Firebase project ID after deployment
    this.baseURL = 'https://us-central1-b1t-sched.cloudfunctions.net';
  }

  /**
   * Get authentication token for current user
   * @returns {Promise<string>} Firebase ID token
   * @throws {Error} If user is not authenticated
   */
  async getAuthToken() {
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken();
  }

  /**
   * Send password reset link to a user
   * @param {string} userId - Firebase Auth UID of the user
   * @returns {Promise<Object>} Response object with success and message
   * @throws {Error} If the request fails
   */
  async sendPasswordReset(userId) {
    try {
      const token = await this.getAuthToken();

      try {
        const response = await fetch(`${this.baseURL}/sendPasswordReset`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send password reset');
        }

        return data;
      } catch (networkError) {
        if (networkError.message.includes('Failed to fetch')) {
          console.error('CORS or Network Error:', networkError);
          throw new Error('Server connection failed. This may be a CORS issue if running locally, or the backend is down.');
        }
        throw networkError;
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Delete a user account
   * @param {string} userId - Firebase Auth UID of the user
   * @returns {Promise<Object>} Response object with success and message
   * @throws {Error} If the request fails
   */
  async deleteUser(userId) {
    try {
      const token = await this.getAuthToken();

      try {
        const response = await fetch(`${this.baseURL}/deleteUser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete user');
        }

        return data;
      } catch (networkError) {
        if (networkError.message.includes('Failed to fetch')) {
          console.error('CORS or Network Error:', networkError);
          throw new Error('Server connection failed. This may be a CORS issue if running locally, or the backend is down.');
        }
        throw networkError;
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const adminAPI = new AdminAPI();
