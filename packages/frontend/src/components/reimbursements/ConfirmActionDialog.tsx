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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        disabled={loading}
                        onClick={onClose}
                        type="button"
                        variant="outline"
                    >
                        Cancel
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
