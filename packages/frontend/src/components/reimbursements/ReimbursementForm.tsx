import { CategorySelect } from '@/components/categories/CategorySelect.tsx';
import { FieldError } from '@/components/shared/FieldError.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';

import type {
    FieldErrors,
    UseFormRegister,
    UseFormSetValue,
} from 'react-hook-form';

type FormFields = {
    amount?: number;
    categoryId?: string;
    description?: string;
    expenseDate?: string;
};

type Props = {
    categoryId: string;
    errors: FieldErrors<FormFields>;
    isSubmitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register: UseFormRegister<any>;
    rootError?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue: UseFormSetValue<any>;
    submitLabel: string;
    title?: string;
};

export function ReimbursementForm({
    categoryId,
    errors,
    isSubmitting,
    onSubmit,
    register,
    rootError,
    setValue,
    submitLabel,
    title,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">
                    {title ?? 'Details'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={onSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Lunch with client"
                            {...register('description')}
                        />
                        <FieldError message={errors.description?.message} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount ($)</Label>
                        <Input
                            id="amount"
                            placeholder="0.00"
                            step="0.01"
                            type="number"
                            {...register('amount')}
                        />
                        <FieldError message={errors.amount?.message} />
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <CategorySelect
                            onChange={(value) =>
                                setValue('categoryId', value)
                            }
                            value={categoryId}
                        />
                        <FieldError message={errors.categoryId?.message} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expenseDate">Expense Date</Label>
                        <Input
                            id="expenseDate"
                            type="date"
                            {...register('expenseDate')}
                        />
                        <FieldError message={errors.expenseDate?.message} />
                    </div>

                    {rootError && (
                        <p className="text-destructive text-sm">
                            {rootError}
                        </p>
                    )}

                    <Button
                        className="w-full"
                        disabled={isSubmitting}
                        type="submit"
                    >
                        {isSubmitting ? 'Saving...' : submitLabel}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
