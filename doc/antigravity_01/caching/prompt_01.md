I want to fix some issues with the Google Classroom integration. 

#issue: clicking on the Classroom toggle shows a Google sign in interface without actually signing in. It checks for a log in token, that verifies if the user is already logged in or not. But the check fails and "Try Again" button shows, that leads to a normal Google Sign in anyway. 

#fix-plan:
- If the access token cannot be fetched at all, then please remove this functionality that shows (while checking the access token) a brief and uninteractable google sign in screen. Th users should simply Sign in again into the Classroom, after using the classroom toggle.

#debugging:
the browser console shows the following messages when loading the website:
"
iframe.js:311  Info: The current domain is not authorized for OAuth operations. This will prevent signInWithPopup, signInWithRedirect, linkWithPopup and linkWithRedirect from working. Add your domain (b1tsched.netlify.app) to the OAuth redirect domains list in the Firebase console -> Authentication -> Settings -> Authorized domains tab.
"
and this when using the Classroom toggle:
"
client:81  [GSI_LOGGER-TOKEN_CLIENT]: Set token failed. No access token in response.
_.G @ client:81
Du.i @ client:375
(anonymous) @ client:129
classroom.js:69  Error fetching access token: {error_subtype: 'access_denied', error: 'interaction_required'}
"