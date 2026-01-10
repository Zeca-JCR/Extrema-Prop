'use client';

import { useEffect } from 'react';
import { seedInitialData } from '@/lib/storage';

// Componente para inicializar dados do localStorage
export function InitStorage() {
    useEffect(() => {
        seedInitialData();
    }, []);

    return null;
}
