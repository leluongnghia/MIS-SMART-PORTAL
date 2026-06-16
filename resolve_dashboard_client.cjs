
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/app/[locale]/(admin)/dashboard/dashboard-client.tsx");
let content = fs.readFileSync(file, "utf8");

// we need to keep BOTH `tab` and `initialData` and the useEffect.
content = content.replace(
  /<<<<<<< Updated upstream[\s\S]*?=======\s*export default function DashboardClient\(\{ initialData \}: \{ initialData\?: any \}\) \{\s*>>>>>>> Stashed changes/,
  `export default function DashboardClient({ tab, initialData }: { tab?: string, initialData?: any }) {
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const loggedIn = localStorage.getItem("mis_edutask_logged_in") === "true";
    const savedUserId = localStorage.getItem("mis_edutask_logged_in_user_id");
    if (loggedIn && savedUserId) {
      import("@/src/mockData").then(({ MOCK_USERS }) => {
        const matched = MOCK_USERS.find(u => u.id === savedUserId);
        if (matched) setCurrentUser(matched);
      });
    }
    setIsReady(true);
  }, []);`
);

fs.writeFileSync(file, content);
console.log("Resolved dashboard-client.tsx");

