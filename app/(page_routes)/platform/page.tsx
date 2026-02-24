import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AuthLanding from '../../components/auth/AuthLanding';

export default async function LoginPage() {
    const session = await auth();

    if (session?.user) {
        redirect('/b2b/dashboard');
    }

    return <AuthLanding />;
}
