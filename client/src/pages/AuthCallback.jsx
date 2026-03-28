import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Redirect to home page with search params - OAuth is handled there
        navigate({
            pathname: '/',
            search: location.search
        }, { replace: true });
    }, [navigate, location.search]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
