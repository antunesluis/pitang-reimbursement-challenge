import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button.tsx';

export function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-muted-foreground text-6xl font-bold">404</h1>
            <p className="text-muted-foreground text-lg">Page not found</p>
            <Button asChild>
                <Link to="/">Back to Home</Link>
            </Button>
        </div>
    );
}
