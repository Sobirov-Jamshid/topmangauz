const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '945011178646-hn9qeq7bgetr649akd0clcvvc51r104o.apps.googleusercontent.com';


let googleCallback: ((data: any) => void) | null = null;

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, options: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export const googleAuth = {
  init: () => {
    if (typeof window !== 'undefined' && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch (error) {
      }
    } else {
    }
  },

  setCallback: (callback: (data: any) => void) => {
    googleCallback = callback;
  },

  renderButton: (elementId: string) => {
    if (typeof window !== 'undefined' && window.google) {
      try {
        const element = document.getElementById(elementId);
        if (element) {
          window.google.accounts.id.renderButton(
            element,
            { 
              theme: 'outline', 
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              width: '100%'
            }
          );
        } else {
        }
      } catch (error) {
      }
    } else {
    }
  },

  handleCredentialResponse: (response: any) => {
    try {
      const decoded = JSON.parse(atob(response.credential.split('.')[1]));
      
      const googleData = {
        credential: response.credential, // Google JWT token
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        given_name: decoded.given_name,
        family_name: decoded.family_name,
        sub: decoded.sub // Google user ID
      };


      if (googleCallback) {
        googleCallback(googleData);
      }

      return googleData;
    } catch (error) {
      throw new Error('Failed to parse Google credentials');
    }
  },

  signOut: () => {
    if (typeof window !== 'undefined' && window.google) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (error) {
      }
    }
  }
};

function handleCredentialResponse(response: any) {
  return googleAuth.handleCredentialResponse(response);
} 