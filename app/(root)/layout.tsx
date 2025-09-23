import Footer from "@/modules/home/footer";
import { Header } from "@/modules/home/header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI-SDK",
  description: "The web based AI-SDK",
};

export default function HomeLayout({
    children
} : {
    children : React.ReactNode
}) {
    return (
        <>
            <Header />
                <main className="z-20 relative w-full pt-0">
                    {
                        children
                    }
                </main>


            <Footer />
        </>
    )
}