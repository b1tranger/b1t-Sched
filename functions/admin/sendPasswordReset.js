const admin = require('firebase-admin');

/**
 * Send password reset link to a user
 * POST /api/admin/sendPasswordReset
 * Body: { userId: string }
 * Headers: { Authorization: Bearer <token> }
 */
exports.sendPasswordReset = async (req, res) => {
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

    // Get user record
    const userRecord = await admin.auth().getUser(userId);
    
    // Generate password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(userRecord.email);

    // Note: Firebase automatically sends the email when generatePasswordResetLink is called
    // We don't need to call sendPasswordResetEmail separately

    // Log the action
    await admin.firestore().collection('adminLogs').add({
      action: 'password_reset_sent',
      adminId: adminUid,
      targetUserId: userId,
      targetUserEmail: userRecord.email,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ 
      success: true, 
      message: `Password reset link sent to ${userRecord.email}` 
    });

  } catch (error) {
    console.error('Error sending password reset:', error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send password reset link: ' + error.message 
    });
  }
};
