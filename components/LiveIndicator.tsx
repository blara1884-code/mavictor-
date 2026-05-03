import React, { useState, useEffect } from 'react';
import socket from '../src/socket';

const LiveIndicator: React.FC<{ light?: boolean }> = ({ light = false }) => {
    const [connected, setConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    return (
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${light ? 'bg-slate-100 border border-slate-200' : 'bg-black/20'}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${light ? 'text-slate-500' : 'text-white/80'}`}>
                {connected ? 'Sincronizado' : 'Desconectado'}
            </span>
        </div>
    );
};

export default LiveIndicator;
