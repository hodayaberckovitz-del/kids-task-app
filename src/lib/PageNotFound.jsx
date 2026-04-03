import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function PageNotFound() {
    const location = useLocation();
    const navigate = useNavigate();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className="text-8xl mb-6"
                >
                    🌟
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <h1 className="text-6xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        404
                    </h1>

                    <h2 className="text-2xl font-bold text-gray-800">
                        אופס! הדף לא נמצא
                    </h2>

                    <p className="text-gray-500 text-lg">
                        הדף שחיפשת לא קיים או הוסר.
                    </p>

                    {isFetched && authData?.isAuthenticated && authData?.user?.role === 'admin' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl text-right"
                            dir="rtl"
                        >
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-orange-700">הערה למנהל</p>
                                    <p className="text-sm text-orange-600 mt-1">
                                        הדף <span className="font-mono font-bold">"{pageName}"</span> לא מומש עדיין. בקש מה-AI ליצור אותו.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="pt-6"
                    >
                        <button
                            onClick={() => navigate(createPageUrl('Dashboard'))}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                        >
                            <Home className="w-5 h-5" />
                            חזרה לדף הבית
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}