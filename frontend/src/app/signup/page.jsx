import PageTransition from "@/components/PageTransition/PageTransition";
import SignUp from "@/components/SignUp/SignUp";

export default function Page() {
    return (
        <PageTransition>
            <SignUp />
        </PageTransition>
    );
}
