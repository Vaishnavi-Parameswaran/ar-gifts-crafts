// Firebase Cloud Messaging Service Worker
// This file handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDev7HgLwkgDVrUHQqS0eSy0ixbSVKzZX8",
    authDomain: "ar-gifts-crafts.firebaseapp.com",
    projectId: "ar-gifts-crafts",
    storageBucket: "ar-gifts-crafts.firebasestorage.app",
    messagingSenderId: "491616476961",
    appId: "1:491616476961:web:71fe4c5e52f5c8ec29e14d"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'AR Gifts & Crafts';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: payload.notification?.icon || '/logo192.png',
        badge: '/logo192.png',
        tag: payload.data?.tag || 'default',
        requireInteraction: payload.data?.requireInteraction === 'true',
        data: payload.data || {},
        actions: payload.data?.actions ? JSON.parse(payload.data.actions) : []
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (let client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If no window is open, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Handle push event (for additional custom handling)
self.addEventListener('push', (event) => {
    console.log('Push event received:', event);
});
