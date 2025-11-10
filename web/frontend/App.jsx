import { useTranslation } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import Routes from "./Routes";

import { PolarisProvider, QueryProvider, TopBar, AppBridgeProvider } from "./components";
import NavigationBar from "./components/NavigationBar";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();

  return (
    <AppBridgeProvider>
      <PolarisProvider>
        <BrowserRouter>
          <QueryProvider>
            <div className="w-full h-screen flex flex-row items-start">
              <div className="min-h-screen flex-0-70 shadow-custom bg-white">
                <NavigationBar />
              </div>
              <div className="flex-1 h-screen overflow-y-auto">
                <TopBar/>
                <Routes pages={pages} />
              </div>
            </div>
          </QueryProvider>
        </BrowserRouter>
      </PolarisProvider>
    </AppBridgeProvider>
  );
}
