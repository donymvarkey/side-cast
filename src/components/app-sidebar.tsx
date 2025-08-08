import {
  Code2Icon, InfoIcon,
  LayoutDashboard,
  MonitorIcon,
  Settings, SlidersHorizontalIcon,
  TerminalSquareIcon, VideoIcon
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {cn} from "@/lib/utils.ts";
import {logo1} from "@/assets/images";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    children: [
      {
        title: "General",
        url: "#",
        icon: SlidersHorizontalIcon
      },
      {
        title: "Scrcpy",
        url: "#",
        icon: MonitorIcon
      },
      {
        title: "Advanced",
        url: "#",
        icon: Code2Icon
      }
    ]
  },
  {
    title: "Recordings",
    url: "/recordings",
    icon: VideoIcon
  },
  {
    title: "Logs",
    url: "/logs",
    icon: TerminalSquareIcon
  },
  {
    title: "About",
    url: "/about",
    icon: InfoIcon
  }
];


export function AppSidebar({active}: { active?: string }) {
  return (
    <Sidebar className={'border-0'}>
      <SidebarContent className={"bg-gray-900"}>
        <SidebarGroup>
          <SidebarGroupLabel className={"text-gray-100 font-quicksand-bold text-3xl flex items-center justify-center my-10"}>
            <img alt={"logo"} src={logo1} className={"size-40"} />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton className={cn("hover:bg-gray-800", active === item?.url ? "bg-gray-700 text-black" : "")} asChild>
                      <a href={item.url}>
                        <item.icon className="w-5 h-5 text-white" />
                        <span className={"text-white font-quicksand-semibold"}>{item.title}</span>
                      </a>
                    </SidebarMenuButton>

                    {/* Nested children rendering */}
                    {item.children && (
                      <SidebarMenu className="ml-4 mt-1">
                        {item.children.map((child) => {

                          return (
                            <SidebarMenuItem key={child.title}>
                              <SidebarMenuButton className={"hover:bg-gray-800"} asChild>
                                <a href={child.url}>
                                  <child.icon className="w-4 h-4 text-white" />
                                  <span className={"text-gray-200 font-quicksand-medium"}>{child.title}</span>
                                </a>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
