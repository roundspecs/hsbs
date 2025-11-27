"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, FileUp, AlertCircle, CheckCircle } from "lucide-react";
import Papa from "papaparse";
import { db } from "@/lib/firebaseConfig";
import { collection, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

type CSVRow = {
    "Name": string;
    "Phone": string;
    "Email": string;
    "Total OTs": string;
};

export function SurgeonImporter({ slug }: { slug: string }) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<"idle" | "importing" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus("idle");
            setMessage("");
        }
    };

    const parseCSV = (file: File): Promise<CSVRow[]> => {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    resolve(results.data as CSVRow[]);
                },
                error: (error) => {
                    reject(error);
                },
            });
        });
    };

    const handleImport = async () => {
        if (!file || !slug) return;

        setImporting(true);
        setStatus("importing");
        setProgress(0);
        setMessage("Parsing CSV...");

        try {
            const rows = await parseCSV(file);
            const total = rows.length;
            setMessage(`Found ${total} surgeons. Starting import...`);

            // Batch processing
            const BATCH_SIZE = 400;
            const chunks = [];
            for (let i = 0; i < total; i += BATCH_SIZE) {
                chunks.push(rows.slice(i, i + BATCH_SIZE));
            }

            let processed = 0;

            for (const chunk of chunks) {
                const batch = writeBatch(db);
                const surgeonsRef = collection(db, `workspaces/${slug}/surgeons`);

                chunk.forEach((row) => {
                    // Mapping Logic
                    const surgeonData = {
                        name: row["Name"] || "",
                        phone: row["Phone"] || null,
                        email: row["Email"] || null,
                        totalCases: Number(row["Total OTs"]?.replace(/[^0-9.-]+/g, "")) || 0,
                        hospitalAffiliation: null,
                        createdAt: serverTimestamp(),
                    };

                    // Skip invalid rows
                    if (!surgeonData.name) return;

                    const newDocRef = doc(surgeonsRef); // Auto-ID
                    batch.set(newDocRef, surgeonData);
                });

                await batch.commit();
                processed += chunk.length;
                setProgress((processed / total) * 100);
            }

            setStatus("success");
            setMessage(`Successfully imported ${total} surgeons.`);
            setFile(null);
            setTimeout(() => {
                setOpen(false);
                router.refresh();
                window.location.reload();
            }, 1500);

        } catch (err) {
            console.error("Import error:", err);
            setStatus("error");
            setMessage("Failed to import surgeons. Please check the file format.");
        } finally {
            setImporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Surgeons</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to bulk import surgeons.
                        <br />
                        Required columns: <code>Name</code>. Optional: <code>Phone</code>, <code>Email</code>, <code>Total OTs</code>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Input
                            id="csv-file"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            disabled={importing}
                        />
                    </div>

                    {status === "importing" && (
                        <div className="space-y-2">
                            <Progress value={progress} />
                            <p className="text-sm text-muted-foreground text-center">{Math.round(progress)}% Complete</p>
                        </div>
                    )}

                    {message && (
                        <div className={`flex items-center gap-2 text-sm ${status === "error" ? "text-destructive" : status === "success" ? "text-green-600" : "text-muted-foreground"}`}>
                            {status === "error" ? <AlertCircle className="h-4 w-4" /> : status === "success" ? <CheckCircle className="h-4 w-4" /> : null}
                            {message}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={importing}>
                        Cancel
                    </Button>
                    <Button onClick={handleImport} disabled={!file || importing}>
                        {importing ? (
                            <>
                                <FileUp className="mr-2 h-4 w-4 animate-bounce" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload & Import
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
