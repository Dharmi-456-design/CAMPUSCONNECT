declare module 'expo-router' {
  export const Stack: any;
  export const Tabs: any;
  export const router: {
    push: (href: any) => void;
    replace: (href: any) => void;
    back: () => void;
  };
  export const Redirect: any;
  export const Link: any;
}

