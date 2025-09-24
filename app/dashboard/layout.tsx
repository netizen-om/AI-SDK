import { SidebarProvider } from "@/components/ui/sidebar";
import { getAllPlaygoundForUser } from "@/modules/dashboard/actions";
import { DashboardSidebar } from "@/modules/dashboard/components/dashboard-siderbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const playgroundData = await getAllPlaygoundForUser();

  // Store icon names (strings) instead of the components themselves
  const technologyIconMap: Record<string, string> = {
    REACT: "Zap",
    NEXTJS: "Lightbulb",
    EXPRESS: "Database",
    VUE: "Compass",
    HONO: "FlameIcon",
    ANGULAR: "Terminal",
  };

  const formattedPlaygoundData = playgroundData?.map((item) => ({
    id : item.id,
    name : item.title,
    //TODO : STAR
    starred : false,
    icon : technologyIconMap[item.template] || "Code2"
  }))

  return (
    <>
      <SidebarProvider>
        <div className="flex min-h-screen w-full overflow-x-hidden">

            {/* @ts-ignore */}
            <DashboardSidebar intialPlaygoundData={formattedPlaygoundData} />

          <main className="flex-1">{children}</main>
        </div>
      </SidebarProvider>
      ;
    </>
  );
}
