import { StatusBadge } from '@/components/reimbursements/StatusBadge.tsx';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import { Separator } from '@/components/ui/separator.tsx';

import type { Reimbursement } from '@/types/index.ts';

type Props = {
    data: Reimbursement;
};

export function ReimbursementDetailsCard({ data }: Props) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <span className="text-muted-foreground text-sm font-medium">
                            Amount
                        </span>
                        <p className="text-lg font-semibold">
                            ${data.amount.toFixed(2)}
                        </p>
                    </div>
                    <Separator />
                    <div>
                        <span className="text-muted-foreground text-sm font-medium">
                            Category
                        </span>
                        <p>{data.category.name}</p>
                    </div>
                    <Separator />
                    <div>
                        <span className="text-muted-foreground text-sm font-medium">
                            Expense Date
                        </span>
                        <p>
                            {new Date(data.expenseDate).toLocaleDateString()}
                        </p>
                    </div>
                    <Separator />
                    <div>
                        <span className="text-muted-foreground text-sm font-medium">
                            Status
                        </span>
                        <p>
                            <StatusBadge status={data.status} />
                        </p>
                    </div>
                    {data.rejectionReason && (
                        <>
                            <Separator />
                            <div>
                                <span className="text-muted-foreground text-sm font-medium">
                                    Rejection Reason
                                </span>
                                <p className="text-destructive">
                                    {data.rejectionReason}
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Requester</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <span className="text-muted-foreground text-sm font-medium">
                            Name
                        </span>
                        <p>{data.requester.name}</p>
                    </div>
                    <Separator />
                    <div>
                        <span className="text-muted-foreground text-sm font-medium">
                            Email
                        </span>
                        <p>{data.requester.email}</p>
                    </div>
                    <Separator />
                    <div>
                        <span className="text-muted-foreground text-sm font-medium">
                            Created
                        </span>
                        <p>{new Date(data.createdAt).toLocaleString()}</p>
                    </div>
                    <Separator />
                    <div>
                        <span className="text-muted-foreground text-sm font-medium">
                            Updated
                        </span>
                        <p>{new Date(data.updatedAt).toLocaleString()}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
