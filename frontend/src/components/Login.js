import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Login = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        let authError = null;

        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            authError = error;
        } else {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            });
            authError = error;
        }

        if (authError) {
            alert(authError.message);
        } else {
            onLogin();
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
            <div className="w-full max-w-md bg-black p-8 rounded-lg shadow-2xl border border-[#282828] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1DB954] to-transparent opacity-50"></div>

                <div className="flex justify-center mb-8 mt-2">
                    <div className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center text-black font-black text-3xl leading-none shadow-[0_0_15px_rgba(29,185,84,0.5)]">
                        S
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-white text-center mb-8 tracking-tight">
                    {isLogin ? 'Log in to SignSprint' : 'Sign up for SignSprint'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-bold text-white mb-2 ml-1" htmlFor="name">
                                What should we call you?
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter a profile name."
                                required
                                className="w-full bg-[#121212] border border-[#727272] text-white rounded-md p-3.5 hover:border-white focus:outline-none focus:border-white focus:ring-2 focus:ring-white transition-all placeholder:text-[#b3b3b3]"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-white mb-2 ml-1" htmlFor="email">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            required
                            className="w-full bg-[#121212] border border-[#727272] text-white rounded-md p-3.5 hover:border-white focus:outline-none focus:border-white focus:ring-2 focus:ring-white transition-all placeholder:text-[#b3b3b3]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-white mb-2 ml-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className="w-full bg-[#121212] border border-[#727272] text-white rounded-md p-3.5 hover:border-white focus:outline-none focus:border-white focus:ring-2 focus:ring-white transition-all placeholder:text-[#b3b3b3]"
                        />
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-[15px] pt-[14px] pb-[14px] px-8 rounded-full transition-all transform active:scale-95 flex items-center justify-center tracking-wide"
                        >
                            {isLogin ? 'LOG IN' : 'SIGN UP'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-[#282828] text-center">
                    <p className="text-[#b3b3b3] font-medium">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-white font-bold hover:text-[#1DB954] hover:underline transition-colors focus:outline-none"
                        >
                            {isLogin ? "Sign up" : "Log in"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
