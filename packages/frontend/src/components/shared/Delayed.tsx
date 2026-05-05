import { useEffect, useState } from 'react';

type Props = {
    children: React.ReactNode;
    ms?: number;
};

export function Delayed({ children, ms = 150 }: Props) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const id = setTimeout(() => setShow(true), ms);
        return () => clearTimeout(id);
    }, [ms]);

    if (!show) return null;
    return <>{children}</>;
}
