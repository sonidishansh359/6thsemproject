import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchAdminBalance, fetchAdminTransactions } from "../lib/adminApi";
import { Loader2, DollarSign, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";

const AdminEarnings = () => {
    const [balance, setBalance] = useState<{ availableBalance: number; totalEarnings: number } | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [balanceData, transactionsData] = await Promise.all([
                fetchAdminBalance(),
                fetchAdminTransactions()
            ]);
            setBalance(balanceData);
            setTransactions(transactionsData);
        } catch (error) {
            console.error("Failed to load earnings data:", error);
            toast.error("Failed to load earnings data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Earnings & Wallet</h1>
                <p className="text-muted-foreground">Manage admin wallet and view transaction history.</p>

                {/* DEBUG SECTION */}
                <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 text-xs rounded border border-yellow-300 font-mono">
                    <strong>DEBUG:</strong> Token Status: {localStorage.getItem('adminToken') ? "✅ Present" : "❌ MISSING"}
                    <br />
                    Token Length: {localStorage.getItem('adminToken')?.length || 0}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{balance?.availableBalance?.toFixed(2) || '0.00'}</div>
                        <p className="text-xs text-muted-foreground">Current funds available for payout</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Lifetime Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{balance?.totalEarnings?.toFixed(2) || '0.00'}</div>
                        <p className="text-xs text-muted-foreground">Total order value processed</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No transactions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx) => (
                                    <TableRow key={tx._id}>
                                        <TableCell>{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {tx.type === 'earning' ? (
                                                    <ArrowDownLeft className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                                                )}
                                                <span className="capitalize">{tx.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{tx.description || '-'}</TableCell>
                                        <TableCell className={`text-right font-medium ${tx.type === 'earning' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'earning' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${tx.status === 'success' ? 'bg-green-100 text-green-800' :
                                                tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminEarnings;
