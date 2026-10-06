import { addNotificationReceivedListener } from 'expo-notifications';

export function subscribeToReceivedNotificationIdentifiers(listener: (identifier: string) => void): () => void {
  const subscription = addNotificationReceivedListener((notification) => {
    listener(notification.request.identifier);
  });
  return () => {
    subscription.remove();
  };
}
