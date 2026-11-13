import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Root index — redirects to splash screen
 */
export default function Index() {
  return <Redirect href="/(auth)/splash" />;
}
