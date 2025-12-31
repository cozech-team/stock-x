import PageTransition from "@/components/PageTransition/PageTransition";
import SignIn from "@/components/SignIn/SignIn";

export default function Page() {
    return (
        <PageTransition>
            <SignIn />
        </PageTransition>
    );
}
