import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FieldError } from '@/components/shared/FieldError.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import {
    type RejectReimbursementFormData,
    rejectReimbursementSchema,
} from '@/schemas/reimbursement.schema.ts';

type Props = {
    onClose: () => void;
    onSubmit: (data: RejectReimbursementFormData) => Promise<void>;
    open: boolean;
};

export function RejectDialog({ onClose, onSubmit, open }: Props) {
    const {
        formState: { errors, isSubmitting },
        handleSubmit,
        register,
    } = useForm<RejectReimbursementFormData>({
        mode: 'onBlur',
        resolver: zodResolver(rejectReimbursementSchema),
    });

    return (
        <Dialog onOpenChange={onClose} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Reimbursement</DialogTitle>
                    <DialogDescription>
                        Provide a reason for rejecting this request.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="Enter rejection reason..."
                                {...register('rejectionReason')}
                            />
                            <FieldError
                                message={errors.rejectionReason?.message}
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            onClick={onClose}
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isSubmitting}
                            type="submit"
                            variant="destructive"
                        >
                            {isSubmitting ? 'Rejecting...' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
