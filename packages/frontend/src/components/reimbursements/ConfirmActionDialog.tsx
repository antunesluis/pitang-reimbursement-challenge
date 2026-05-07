import { Button } from '@/components/ui/button.tsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';

type Props = {
    closeLabel: string;
    confirmLabel: string;
    confirmVariant?: 'default' | 'destructive' | 'outline';
    description: string;
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
    open: boolean;
    title: string;
};

export function ConfirmActionDialog({
    closeLabel,
    confirmLabel,
    confirmVariant = 'default',
    description,
    loading,
    onClose,
    onConfirm,
    open,
    title,
}: Props) {
    return (
        <Dialog onOpenChange={onClose} open={open}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="text-sm">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        disabled={loading}
                        onClick={onClose}
                        type="button"
                        variant="outline"
                    >
                        {closeLabel}
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={onConfirm}
                        variant={confirmVariant}
                    >
                        {loading ? 'Processing...' : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
