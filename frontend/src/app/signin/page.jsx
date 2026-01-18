import PageTransition from "@/components/PageTransition/PageTransition";
import SignInWrapper from "@/components/SignIn/SignInWrapper";

export default function Page() {
    return (
        <PageTransition>
            <SignInWrapper />
        </PageTransition>
    );
}
