import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Navbar } from "./componenets";
import useStore from "./store";
import { setAuthToken } from "./libs/apiCall";
import { Dashboard } from "./pages/dashboard";
import { Transactions } from "./pages/transactions";
import { AccountsPage } from "./pages/account-page";
import { SettingsPage } from "./pages/settings";
import { SignUp } from "./pages/sign-up";
import { SignIn } from "./pages/sign-in";
// import { Dashboard, Transactions, AccountsPage, SettingsPage } from "./pages";

const RootLayout = () => {
  const user = useStore((state) => state.user);

  setAuthToken(user?.token);

  return !user ? (
    <Navigate to={"/sign-in"} replace={true} />
  ) : (
    <>
      <Navbar />
      <div className="min-h-[cal(h-screen-100px)]">
        <Outlet />
      </div>
    </>
  );
};

const App = () => {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [theme]);

  return (
    <main>
      <div className="w-full min-h-screen px-6 bg-white md:px-20 dark:bg-slate-900">
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Navigate to={"/overview"} />} />
            <Route path="/overview" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
        </Routes>
      </div>

      <Toaster richColors position="top-center" />
    </main>
  );
};

export default App;
