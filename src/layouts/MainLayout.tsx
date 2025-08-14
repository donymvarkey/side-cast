import { Outlet, useLocation } from "react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.tsx";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import { paths } from "@/constants";
import { Toaster } from "@/components/ui/sonner";

const MainLayout = () => {
  const location = useLocation();
  return (
    <div className="w-full h-full">
      <SidebarProvider>
        <div className={"flex w-full h-full"}>
          <div className={"text-white p-4"}>
            <AppSidebar active={location?.pathname} />
          </div>
          <div className={"h-full w-full"}>
            <main className={"w-full h-full py-4"}>
              <div className={"flex items-center gap-x-3 w-full h-full"}>
                <SidebarTrigger
                  className={
                    "text-white hover:bg-transparent hover:text-white size-8"
                  }
                />
                <span
                  className={"text-gray-100 font-quicksand-semibold text-3xl"}
                >
                  {paths[location?.pathname as keyof typeof paths]}
                </span>
              </div>
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
    </div>
  );
};

export default MainLayout;
