import "./login.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user, loading: authLoading, supabase } = useAuth();

    useEffect(() => {
        // If user is already logged in, redirect to home
        if (user && !authLoading) {
            navigate("/administracion/iphonepage", { replace: true });
        }
    }, [user, authLoading, navigate]);

    const handlePasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (loginError) {
                setError(loginError.message);
                setLoading(false);
            }
        } catch (err) {
            console.error('Error inesperado:', err);
            setError('Error inesperado al iniciar sesión');
            setLoading(false);
        }
    };

    // Show loading while checking auth state
    if (authLoading) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <h1>Cargando...</h1>
                    <p>Verificando sesión</p>
                </div>
            </div>
        );
    }

    // Show login form
    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Iniciar Sesión</h1>
                <p>Accede a tu cuenta</p>
                
                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handlePasswordLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Ingresando..." : "Iniciar Sesión"}
                    </button>
                </form>
            </div>
        </div>
    );
}