// src/app/login/page.tsx
import { redirect } from 'next/navigation';
import { auth0 } from '../../../src/lib/auth0';  // ← adjust path as needed
import AuthLanding from '../../components/auth/AuthLanding';

export default async function LoginPage() {
    const session = await auth0.getSession();  // ← now works!

    if (session?.user) {
        redirect('/dashboard');  // or your protected landing page
    }


    return <AuthLanding />;
}