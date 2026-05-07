import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
import {
    type CreateCategoryFormData,
    createCategorySchema,
} from '@/schemas/category.schema.ts';

type Props = {
    onCancel: () => void;
    onCreate: (name: string) => Promise<void>;
};

export function CategoryForm({ onCancel, onCreate }: Props) {
    const {
        formState: { errors, isSubmitting },
        handleSubmit,
        register,
        reset,
        setError,
    } = useForm<CreateCategoryFormData>({
        resolver: zodResolver(createCategorySchema),
    });

    async function onSubmit(data: CreateCategoryFormData) {
        try {
            await onCreate(data.name);
            reset();
        } catch (err) {
            setError('root', {
                message:
                    err instanceof Error
                        ? err.message
                        : 'Failed to create',
            });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Create Category</CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    className="flex items-end gap-3"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Transporte"
                            {...register('name')}
                        />
                        <FieldError message={errors.name?.message} />
                    </div>
                    <Button disabled={isSubmitting} type="submit">
                        {isSubmitting ? 'Creating...' : 'Create'}
                    </Button>
                    <Button
                        onClick={onCancel}
                        type="button"
                        variant="outline"
                    >
                        Cancel
                    </Button>
                </form>
                {errors.root?.message && (
                    <p className="text-destructive mt-2 text-sm">
                        {errors.root.message}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
