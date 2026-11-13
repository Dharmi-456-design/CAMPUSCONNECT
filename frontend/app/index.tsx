import { Redirect } from 'expo-router';

/**
 * Root index — redirects to the splash screen on first launch.
 * After authentication, AppNavigator handles routing internally.
 */
export default function Index() {
  return <Redirect href="/(auth)/splash" />;
}

