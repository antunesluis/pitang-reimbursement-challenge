export function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function formatCurrency(amount: number) {
    return `$${amount.toFixed(2)}`;
}
