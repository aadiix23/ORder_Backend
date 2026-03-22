const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let cachedMessaging = undefined;

const loadServiceAccountFromEnv = () => {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    }

    if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
    ) {
        return {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        };
    }

    const serviceAccountPath =
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (serviceAccountPath) {
        const resolvedPath = path.resolve(serviceAccountPath);
        if (fs.existsSync(resolvedPath)) {
            return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
        }
    }

    return null;
};

const getFirebaseMessaging = () => {
    if (cachedMessaging !== undefined) {
        return cachedMessaging;
    }

    try {
        if (!admin.apps.length) {
            const serviceAccount = loadServiceAccountFromEnv();

            if (!serviceAccount) {
                cachedMessaging = null;
                return cachedMessaging;
            }

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }

        cachedMessaging = admin.messaging();
        return cachedMessaging;
    } catch (error) {
        console.error("Firebase admin initialization failed:", error.message);
        cachedMessaging = null;
        return cachedMessaging;
    }
};

exports.sendOrderPushNotification = async ({ tokens, title, body, data = {} }) => {
    const uniqueTokens = [...new Set((tokens || []).filter(Boolean))];

    if (!uniqueTokens.length) {
        return { success: true, skipped: true, reason: "No device tokens available" };
    }

    const messaging = getFirebaseMessaging();

    if (!messaging) {
        return {
            success: false,
            skipped: true,
            reason: "Firebase admin credentials are not configured"
        };
    }

    try {
        const response = await messaging.sendEachForMulticast({
            tokens: uniqueTokens,
            notification: {
                title,
                body
            },
            data: Object.fromEntries(
                Object.entries(data).map(([key, value]) => [key, String(value)])
            ),
            android: {
                priority: "high",
                notification: {
                    channelId: "orders_alerts",
                    sound: "bell_ring"
                }
            }
        });

        return {
            success: true,
            skipped: false,
            response
        };
    } catch (error) {
        console.error("Failed to send order push notification:", error.message);
        return {
            success: false,
            skipped: false,
            reason: error.message
        };
    }
};
