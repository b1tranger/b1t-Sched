const admin = require('firebase-admin');

/**
 * Delete a user account
 * POST /api/admin/deleteUser
 * Body: { userId: string }
 * Headers: { Authorization: Bearer <token> }
 */
exports.deleteUser = async (req, res) => {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    // Verify admin authentication
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No authentication token provided' 
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const adminUid = decodedToken.uid;

    // Check if requesting user is admin
    const adminDoc = await admin.firestore()
      .collection('users')
      .doc(adminUid)
      .get();

    if (!adminDoc.exists || !adminDoc.data().isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions. Admin access required.' 
      });
    }

    // Get target user ID from request
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    // Prevent deletion of admin accounts
    const targetUserDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (targetUserDoc.exists && targetUserDoc.data().isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Cannot delete admin accounts' 
      });
    }

    // Get user record before deletion (for logging)
    const userRecord = await admin.auth().getUser(userId);
    const userEmail = userRecord.email;

    // Delete user from Firebase Authentication
    await admin.auth().deleteUser(userId);

    // Delete user document from Firestore
    await admin.firestore().collection('users').doc(userId).delete();

    // Log the action
    await admin.firestore().collection('adminLogs').add({
      action: 'user_deleted',
      adminId: adminUid,
      deletedUserId: userId,
      deletedUserEmail: userEmail,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ 
      success: true, 
      message: `User ${userEmail} has been permanently deleted` 
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      error: 'Failed to delete user: ' + error.message 
    });
  }
};
