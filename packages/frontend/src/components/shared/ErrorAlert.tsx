export function ErrorAlert({ message }: { message: string }) {
    return (
        <div className="text-destructive rounded-md border p-4">
            <p>{message}</p>
        </div>
    );
}
